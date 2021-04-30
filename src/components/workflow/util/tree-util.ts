import _ from 'lodash';
import NodeModel from "@/components-com/workflow/model/node.model";
import Utils from '@/utils/utils';
import {NODE_KEY, UUID_NUM} from "@/components-com/workflow/const/workflow.const";
import WorkflowModel from "@/components-com/workflow/model/workflow.model";
import EventModel from "@/components-com/workflow/model/event.model";
import TaskModel from "@/components-com/workflow/model/task.model";
import SequenceModel from "@/components-com/workflow/model/sequence.model";
import {ConditionRelationEnum, ConditionTypeEnum, NodeTypeEnum} from "@/components-com/workflow/enums/node.enum";
import ConditionListModel from "@/components-com/workflow/model/condition-list.model";
import ConditionModel from "@/components-com/workflow/model/condition.model";
import GatewayModel from "@/components-com/workflow/model/gateway.model";

export default class TreeUtil {


    /**
     * 主要方法属性递归
     * @param node
     * @param key
     * @param value
     */
    public static findNodeByProperties(node: NodeModel, value: string, key: string = NODE_KEY): NodeModel {
        let curNode;
        if (!_.isEmpty(node[key]) && node[key] === value) {
            return node;
        } else if (!_.isEmpty(node.conditionNode)) {

            for (let i = 0; i < node.conditionNode.length; i++) {
                if (node.conditionNode[i][key] === value) {
                    curNode = node.conditionNode[i];
                } else if (!_.isEmpty(node.conditionNode[i].child)) {
                    curNode = this.findNodeByProperties(node.conditionNode[i].child, value, key);
                }
                if (curNode) {
                    break;
                }
            }
        }
        if (curNode) {
            return curNode;
        }
        if (!_.isEmpty(node.child)) {
            return this.findNodeByProperties(node.child, value, key);
        }
    }

    /**
     * 根据节点id查找父节点
     * @param node
     * @param nodeId
     */
    public static findParentNodeById(node: NodeModel, nodeId: string): NodeModel {
        if (_.isEmpty(node)) {
            console.warn('node为空');
            return;
        }
        let curNode;
        if (!_.isEmpty(node.conditionNode) && node.conditionNode.some(item => item.nodeId === nodeId)) {
            return node;
        } else if (!_.isEmpty(node.conditionNode)) {
            for (let i = 0; i < node.conditionNode.length; i++) {
                if (!_.isEmpty(node.conditionNode[i].child)) {
                    curNode = this.findParentNodeById(node.conditionNode[i], nodeId);
                }
                if (curNode) {
                    break;
                }
            }
        }
        if (curNode) {
            return curNode;
        }
        if (node.child && node.child.nodeId === nodeId) {
            return node;
        } else if (node.child) {
            return this.findParentNodeById(node.child, nodeId);
        }
    }

    /**
     * 重置节点id
     * @param node
     */
    public static resetNodeId(node: NodeModel) {
        node.nodeId = this.getTreeId();
        if (!_.isEmpty(node.conditionNode)) {
            node.conditionNode.forEach(item => {
                item.nodeId = this.getTreeId();
                item.pNodeId = node.nodeId;
                if (!_.isEmpty(item.child)) {
                    this.resetNodeId(item.child);
                }
            })
        }
        if (!_.isEmpty(node.child)) {
            node.child.pNodeId = node.nodeId;
            this.resetNodeId(node.child);
        }
    }

    /**
     * 创建节点id
     */
    public static getTreeId(): string {
        return Utils.uuid(UUID_NUM);
    }

    /**
     * node模型转为后端模型
     * @param nodeInfo
     * @param workflowData
     */
    public static dataTransfer(nodeInfo: NodeModel, workflowData: WorkflowModel) {
        workflowData.startEvent = new EventModel(this.getTreeId());
        workflowData.endEvent = new EventModel(this.getTreeId());

        const taskList: TaskModel[] = [];
        const sequenceList: SequenceModel[] = [];
        const gatewayList: GatewayModel[] = [];
        const serviceTaskList: TaskModel[] = [];

        // 构建线
        this.getListInfo(nodeInfo, taskList, sequenceList, gatewayList, serviceTaskList, workflowData);

        // 增加开始事件线
        const startLine = new SequenceModel(this.getTreeId());
        startLine.sourceRef = workflowData.startEvent.id;
        startLine.targetRef = taskList[0].id;
        sequenceList.splice(0, 0, startLine);

        // 结束事件线
        // const endLine = new SequenceModel(this.getTreeId());
        // endLine.sourceRef = taskList[taskList.length - 1].id;
        // endLine.targetRef = workflowData.endEvent.id;

        //sequenceList.push(endLine);
        workflowData.taskList = taskList;
        // 将直接连到最后的条件划线至结束节点
        sequenceList.filter(item => _.isEmpty(item.targetRef)).forEach(item => item.targetRef = workflowData.endEvent.id)
        workflowData.sequenceList = sequenceList;
        workflowData.gatewayList = gatewayList;
        workflowData.serviceTaskList = serviceTaskList;
    }

    /**
     * 递归调用获取任务信息
     */
    private static getListInfo(node: NodeModel,
                               taskList: TaskModel[],
                               sequenceList: SequenceModel[],
                               gatewayList: GatewayModel[],
                               serviceTaskList: TaskModel[],
                               workflowData: WorkflowModel) {
        taskList = taskList || [];
        sequenceList = sequenceList || [];
        gatewayList = gatewayList || [];
        serviceTaskList = serviceTaskList || [];
        let task;
        // 如果节点不是条件且不是抄送节点创建任务
        if (![NodeTypeEnum.conditionItem, NodeTypeEnum.condition, NodeTypeEnum.cc].includes(node.type)) {
            task = new TaskModel(node.nodeId, node.name);
            task.category = node.type;
            task.documentation = node.title;
            taskList.push(task);
        }
        // 抄送节点
        if (NodeTypeEnum.cc === node.type) {
            const ccNode = new TaskModel(node.nodeId, node.name);
            ccNode.documentation = node.title;
            serviceTaskList.push(ccNode);
        }
        // 如果节点是条件 则创建网关
        let gateway;
        if (NodeTypeEnum.condition === node.type) {
            gateway = new EventModel(node.nodeId);
        }

        // 虚拟网关节点
        if (gateway) {
            gatewayList.push(gateway);
        } else if (!_.isEmpty(node.child)) {
            // 如果有子节点则创建连接
            const sequence = new SequenceModel(this.getTreeId());
            sequence.sourceRef = node.nodeId;
            sequence.targetRef = node.child.nodeId;
            sequenceList.push(sequence);
            if (!_.isEmpty(node.child)) {
                this.getListInfo(node.child, taskList, sequenceList, gatewayList, serviceTaskList, workflowData);
            }
        } else {
            const sequence = new SequenceModel(this.getTreeId());
            sequence.sourceRef = node.nodeId;
            sequenceList.push(sequence);
        }
        if (!_.isEmpty(node.conditionNode)) {
            this.conditionNodeHandle(node, taskList, sequenceList, gatewayList, serviceTaskList, workflowData);
        }

    }


    /**
     * 处理条件节点
     */
    private static conditionNodeHandle(node: NodeModel,
                                       taskList: TaskModel[],
                                       sequenceList: SequenceModel[],
                                       gatewayList: GatewayModel[],
                                       serviceTaskList: TaskModel[],
                                       workflowData: WorkflowModel) {
        // 第一个一定是条件 将条件变成线 从网关指向条件的子节点
        node.conditionNode.forEach(item => {
            const sequence = new SequenceModel(this.getTreeId());
            sequence.sourceRef = node.nodeId;
            const conditionChild = item.child;

            if (!_.isEmpty(item.condition)) {
                sequence.conditionExpression = {condition: `\$\{${this.getCondition(item.condition)}\}`};
            }
            // 如果条件节点中有默认标识 则设置网关节点的默认指向节点为条件下第一个任务 如果条件下没有任务则指向结束节点
            if (item.default) {
                const gatewayNode = gatewayList.find(gateway => gateway.id === item.pNodeId);
                if (_.isEmpty(item.child)) {
                    gatewayNode.defaultId = workflowData.endEvent.id;
                } else {
                    gatewayNode.defaultId = item.child.nodeId;
                }
            }
            if (!_.isEmpty(conditionChild)) {
                sequence.targetRef = conditionChild?.nodeId || '';
                this.getListInfo(item.child, taskList, sequenceList, gatewayList, serviceTaskList, workflowData);
            }
            sequenceList.push(sequence);
        })
    }


    // 条件处理
    public static getCondition(condition: ConditionListModel): string {
        if (!_.isEmpty(condition.subCondition)) {
            return condition.subCondition.map(item =>
                `(${this.getConditionItem(item)})`).join(` ${ConditionRelationEnum.or} `);
        }
        return this.getConditionItem(condition);
    }

    // 内层条件处理
    private static getConditionItem(condition: ConditionListModel): string {
        return condition.conditionList.map(item =>
            `${item.field}${item.opera}${item.value}`).join(` ${ConditionRelationEnum.and} `);
    }

    /**
     * 根据后台数据生成树
     * 查找根节点准备树信息
     * @param data
     */
    public static createNodeByWorkflowData(data: WorkflowModel): NodeModel {
        if (!_.isEmpty(data)) {
            const rootId = data.sequenceList.find(item => item.sourceRef === data.startEvent.id).targetRef;
            // 去掉开始节点
            data.sequenceList = data.sequenceList.filter(item => item.sourceRef !== data.startEvent.id);
            // 删除条件里面直接连到终点的线的目标信息
            data.sequenceList.filter(item => item.targetRef === data.endEvent.id).forEach(item => delete item.targetRef)
            // 从任务节点中找到根节点
            const rootData = data.taskList.find(item => item.id === rootId);
            const node = this.convertDataToNode(rootData);
            node.type = NodeTypeEnum.start;
            this.createTree(node, data.taskList, data.sequenceList, data.gatewayList, data.serviceTaskList);
            return node;
        }
        return null;
    }

    /**
     * 构建树
     * @param rootNode
     * @param taskList
     * @param sequenceList
     * @param gatewayList
     * @param serviceTaskList
     */
    private static createTree(rootNode: NodeModel,
                              taskList: TaskModel[],
                              sequenceList: SequenceModel[],
                              gatewayList: EventModel[],
                              serviceTaskList: TaskModel[]) {
        // 递归退出条件
        if (sequenceList.length === 0) {
            return;
        }

        let taskIdx = taskList.findIndex(item => item.id === rootNode.nodeId);
        // 如果节点不在任务列表中 可能在抄送节点中
        if (taskIdx >= 0) {
            // 删除该节点信息
            taskList.splice(taskIdx, 1);
        } else {
            taskIdx = serviceTaskList.findIndex(item => item.id === rootNode.nodeId);
            serviceTaskList.splice(taskIdx, 1);
        }

        // 从线中取出节点的id
        const sequenceIdx = sequenceList.findIndex(item => item.sourceRef === rootNode.nodeId);
        const nextLine = sequenceList[sequenceIdx];
        sequenceList.splice(sequenceIdx, 1);
        let nextNodeIdx = taskList.findIndex(item => item.id === nextLine.targetRef);

        let nextData;
        let childNode;
        // 尝试去抄送列表中查找是否在抄送节点中
        if (nextNodeIdx < 0) {
            nextNodeIdx = serviceTaskList.findIndex(item => item.id === nextLine.targetRef);
            nextData = serviceTaskList[nextNodeIdx];
        } else {
            nextData = taskList[nextNodeIdx];
        }

        if (nextData) {
            childNode = this.convertDataToNode(nextData);
            childNode.pNodeId = rootNode.pNodeId;
            rootNode.child = childNode;
            // 删掉指向最后的线
            if (sequenceList.some(seq => seq.sourceRef === childNode.nodeId && _.isEmpty(seq.targetRef))) {
                // 如果只有source 没有target说明直接指向结束 删掉这些线
                sequenceList = sequenceList.filter(seq => seq.sourceRef === childNode.nodeId && _.isEmpty(seq.targetRef));
            }
        } else if (sequenceList.length) {
            // 网关转为条件节点
            const gatewayNodeIdx = gatewayList.findIndex(item => item.id === nextLine.targetRef);
            nextData = gatewayList[gatewayNodeIdx];
            gatewayList.splice(gatewayNodeIdx, 1);
            childNode = new NodeModel();
            childNode.nodeId = nextData.id;
            childNode.type = NodeTypeEnum.condition;
            childNode.conditionNode = [];

            // 网关下必然有条件节点
            const conditionData = sequenceList.filter(item => item.sourceRef === nextData.id);
            // 重新构建条件节点
            const conditionItemNodes = conditionData.map((item, index) =>
                this.createCondition(item.conditionExpression.condition, nextData.id, index));
            sequenceList = sequenceList.filter(item =>
                !conditionData.some(condition =>
                    condition.sourceRef === item.sourceRef && condition.targetRef === item.targetRef));
            childNode.conditionNode = conditionItemNodes;

            conditionItemNodes.forEach((item, index) => {
                let conditionItemChildData = taskList.find(task => task.id === conditionData[index].targetRef);
                //尝试从抄送节点中拿节点数据
                if (_.isEmpty(conditionItemChildData)) {
                    conditionItemChildData = serviceTaskList.find(task => task.id === conditionData[index].targetRef);
                }
                // 如果网关的默认指向是条件的子节点 则将此条件置为默认条件
                item.default = nextData.defaultId === conditionItemChildData.id;
                // 条件可能直接指向结束
                if (!_.isEmpty(conditionItemChildData)) {
                    const conditionItemChild = this.convertDataToNode(conditionItemChildData);
                    conditionItemChild.pNodeId = item.nodeId;
                    conditionItemChild.type = conditionItemChildData.category;
                    // 拿一个取一个
                    taskList.splice(taskList.findIndex(task => task.id === conditionItemChildData.id), 1);
                    serviceTaskList.splice(serviceTaskList.findIndex(task => task.id === conditionItemChildData.id), 1)
                    item.child = conditionItemChild;
                    if (sequenceList.some(seq => seq.sourceRef === conditionItemChild.nodeId && !seq.targetRef)) {
                        // 如果只有source 没有target说明直接指向结束 删掉这些线
                        sequenceList = sequenceList.filter(seq => seq.sourceRef === conditionItemChild.nodeId && !seq.targetRef);
                    }
                    // 重新构建条件后面的子节点
                    this.createTree(conditionItemChild, taskList, sequenceList, gatewayList, serviceTaskList);
                }
            });
            rootNode.child = childNode
        }


        if (sequenceList.some(item => item.sourceRef === childNode.nodeId && item.targetRef)) {
            this.createTree(childNode, taskList, sequenceList, gatewayList, serviceTaskList);
        }

    }

    /**
     * 转换数据为节点
     * @param data
     */
    private static convertDataToNode(data: TaskModel): NodeModel {
        const node = new NodeModel();
        node.nodeId = data.id;
        node.name = data.name
        node.type = data.category || NodeTypeEnum.cc;
        node.title = data.documentation;
        return node;
    }


    /**
     * 组织条件
     * @param conditionStr
     * @param pNodeId
     * @param idx
     */
    private static createCondition(conditionStr: string, pNodeId: string, idx: number): NodeModel {

        const conditionNode = new NodeModel();
        conditionNode.nodeId = this.getTreeId();
        const condition = new ConditionListModel();
        conditionNode.condition = condition;
        conditionNode.pNodeId = pNodeId;
        conditionNode.level = idx + 1;
        conditionNode.title = 'label.condition';
        conditionNode.type = NodeTypeEnum.conditionItem;
        if (_.isEmpty(conditionStr)) {
            conditionNode.name = 'label.conditionTip';
            return conditionNode;
        }

        conditionStr = conditionStr.replace(/\$|\{|\}/g, '')
        if (conditionStr.includes(ConditionRelationEnum.or)) {
            condition.subCondition = conditionStr.split(ConditionRelationEnum.or).map(item => {
                const conditionTwoLevel = new ConditionListModel();
                const conditionItem = item.replace(/\(|\)/g, '');
                conditionTwoLevel.conditionList = this.splitCondition(conditionItem);
                conditionTwoLevel.opera = ConditionRelationEnum.or;
                return conditionTwoLevel;
            });
            conditionNode.name = conditionStr;

        } else {
            condition.conditionList = this.splitCondition(conditionStr);
            conditionNode.name = conditionStr;
        }

        return conditionNode
    }

    private static splitCondition(condition: string): ConditionModel[] {
        return condition.split(ConditionRelationEnum.and).map(item => {
            const baseCondition = new ConditionModel();
            const data = item.trim().split(/\b/);
            baseCondition.field = data[0];
            baseCondition.opera = data[1] as ConditionTypeEnum;
            baseCondition.value = data[2];
            return baseCondition
        })
    }
}