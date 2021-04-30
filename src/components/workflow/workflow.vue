<template>
    <div class="workflow-container">
        <!--        <div class="workflow-operation" >-->
        <div class="workflow-zoom" :class="{'close':collapse}">
            <div class="zoom-btn" @click="changeZoom(-10)">
                <i class="el-icon-minus"/>
            </div>
            <div class="current-zoom">{{ zoom }}%</div>
            <div class="zoom-btn" @click="changeZoom(10)">
                <i class="el-icon-plus"/>
            </div>
        </div>
        <div class="workflow-operation-btn-container">
            <el-button class="workflow-operation-btn" type="primary" plain @click="onClickPublish">基本资料</el-button>
            <el-button class="workflow-operation-btn" type="primary" @click="onSave">保存</el-button>
        </div>

        <!--        </div>-->
        <div class="workflow-content" :style="`transform: scale(${zoom/100}); transform-origin: 50% 0px 0px;`">
            <div class="node-container">
                <div class="start-container" v-if="nodeInfo">
                    <div class="start-node">{{ $i18n.t('label.start') }}</div>
                </div>
                <node-context :node="nodeInfo"
                              :active-id="activeId"/>
                <div class="end-node" v-if="nodeInfo">
                    <div class="end-node-point"></div>
                    <div class="end-node-text">{{ $i18n.t('label.flowEnd') }}</div>
                </div>
                <!--条件操作抽屉-->
                <condition-drawer :show-condition="showCondition"
                                  :condition-node="currentCondition"
                                  @on-close="showCondition=false"
                                  @on-save="onSaveCondition"/>
                <!--节点操作抽屉-->
                <node-opera-drawer :show-node-opera="nodeOperaState"
                                   :node-info="currentNodeInfo"
                                   @on-save="onSaveNodeInfo"
                                   @on-close="nodeOperaState = false"/>
            </div>
        </div>

        <el-dialog title="流程信息" :visible.sync="dialogVisible" :close-on-click-modal="false">
            <el-form ref="form" :model="workflowData" label-width="120px">
                <el-form-item label="工作流名称">
                    <el-input v-model="workflowData.name" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="备注">
                    <el-input
                        type="textarea"
                        :autosize="{ minRows: 2, maxRows: 4}"
                        placeholder="请输入内容"
                        v-model="workflowData.documentation">
                    </el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script lang="ts">
import {ConditionDirectionEnum, EventTypeEnum, NodeTypeEnum, ZoomEnum} from './enums/node.enum';
import WorkflowService from './service/workflow.service';
import WorkflowModel from './model/workflow.model';
import Utils from '@/utils/utils';
import TreeUtil from './util/tree-util';
import ResponseModel from '@/common/model/response.model';
import NodeModel from './model/node.model';
import {INIT_NODE_NUM} from './const/workflow.const';
import ConditionDrawer from './condition-drawer/condition-drawer.vue';
import {Component, Prop, Watch, Vue} from 'vue-property-decorator';
import NodeContext from './node-context/node-context';
import NodeOperaDrawer from './node-opera-drawer/node-opera-drawer';
import {SettingsGetterEnum} from '@/store/enum/store.enum';
import {ResponseStatusEnum} from '@/common/enum/common.enum';

@Component({components: {ConditionDrawer, NodeContext, NodeOperaDrawer}})
export default class Workflow extends Vue {

    /**
     * 流程id
     */
    @Prop()
    private id: string;
    /**
     * 方法缩小倍数
     */
    private zoom: number = ZoomEnum.default;
    /**
     * 提交数据
     */
    private workflowData: WorkflowModel = new WorkflowModel(Utils.uuid(), '', '');
    /**
     * 模态框状态
     */
    private dialogVisible = false;
    /**
     * 树信息
     **/
    private nodeInfo: NodeModel = new NodeModel();
    /**
     * 激活节点
     */
    private activeId = '';
    /**
     * 条件抽屉状态
     */
    private showCondition = false;
    /**
     * 当前条件节点
     */
    private currentCondition: NodeModel = new NodeModel();
    /**
     * 节点操作抽屉状态
     */
    private nodeOperaState = false;
    /**
     * 当前选择操作节点信息
     */
    private currentNodeInfo: NodeModel = new NodeModel();

    private changeZoom(value: number): void {
        this.zoom = this.zoom + value;
        if (this.zoom < ZoomEnum.min) {
            this.zoom = ZoomEnum.min;
        } else if (this.zoom > ZoomEnum.max) {
            this.zoom = ZoomEnum.max;
        }
    }

    private async onClickPublish() {
        TreeUtil.dataTransfer(this.nodeInfo, this.workflowData);
        this.dialogVisible = true;
    }

    @Watch('nodeInfo', {immediate: true, deep: true})
    private nodeInfoChange(newVal: NodeModel, oldVal: NodeModel) {
        this.nodeInfo = newVal;
    }

    /**
     * 保存工作流
     */
    private onSave() {
        // 提交数据
    }

    private beforeMount() {
        this.getWorkflowData();
    }

    private getWorkflowData() {
        if (!_.isEmpty(this.id)) {
            WorkflowService.getWorkflow(this.id).then((res: ResponseModel<WorkflowModel>) => {
                this.workflowData.name = res.data.name;
                this.workflowData.documentation = res.data.documentation;
                const nodeTree = TreeUtil.createNodeByWorkflowData(res.data);
                console.log(nodeTree);
                this.$nextTick(() => {
                    this.nodeInfo = nodeTree;
                    this.activeId = nodeTree.nodeId;
                });
            });
        } else {
            this.initData();
        }

    }

    private mounted() {
        // 点击切换选中
        this.$bus.$on(EventTypeEnum.clickNode, (data: { nodeId: string, type: NodeTypeEnum }) => {
            this.clickNode(data.nodeId, data.type);
        });

        // 删除
        this.$bus.$on(EventTypeEnum.deleteNode, (nodeId: string): void => {
            this.deleteNode(nodeId);
        });

        // 新增
        this.$bus.$on(EventTypeEnum.addNode, ({type, nodeId}): void => {
            this.onAddNode(type, nodeId);
        });

        // 条件置换优先级
        this.$bus.$on(EventTypeEnum.changeLevel, ({nodeId, type}): void => {
            this.changeLevel(nodeId, type);
        });

        // 拷贝条件
        this.$bus.$on(EventTypeEnum.copyCondition, (nodeId): void => {
            this.copyCondition(nodeId);
        });

        // 删除条件
        this.$bus.$on(EventTypeEnum.deleteCondition, (nodeId): void => {
            this.deleteCondition(nodeId);
        });

        // 新增条件
        this.$bus.$on(EventTypeEnum.addCondition, (nodeId): void => {
            this.addCondition(nodeId);
        });
    }

    private beforeDestroy() {
        this.$bus.$off(Object.values(EventTypeEnum as {}) as string[]);
    }

    /**
     * 删除节点
     */
    private deleteNode(nodeId: string) {
        const closeNode = TreeUtil.findParentNodeById(this.nodeInfo, nodeId);
        if (!_.isEmpty(closeNode.child.child)) {
            closeNode.child = closeNode.child.child;
            closeNode.child.pNodeId = closeNode.nodeId;
        } else {
            delete closeNode.child;
        }
        this.activeId = this.activeId === '' ? closeNode.nodeId : this.nodeInfo.nodeId;
    }

    /**
     * 新增节点
     * @param type
     * @param nodeId
     */
    private onAddNode(type: NodeTypeEnum, nodeId: string) {
        const currentNode = TreeUtil.findNodeByProperties(this.nodeInfo, nodeId);
        const tempNode: NodeModel = new NodeModel();
        tempNode.nodeId = TreeUtil.getTreeId();
        if (type === NodeTypeEnum.condition) {
            const condition = [
                {
                    title: 'label.condition',
                    name: 'label.conditionTip',
                    child: currentNode.child,
                    nodeId: TreeUtil.getTreeId(),
                    type: NodeTypeEnum.conditionItem,
                    pNodeId: tempNode.nodeId
                },
                {
                    title: 'label.condition',
                    name: 'label.conditionTip',
                    nodeId: TreeUtil.getTreeId(),
                    type: NodeTypeEnum.conditionItem,
                    pNodeId: tempNode.nodeId
                }
            ];
            tempNode.conditionNode = [...condition];
        } else if (currentNode.child) {
            tempNode.child = currentNode.child;
        }
        tempNode.type = type;
        tempNode.name = 'label.selectedHandleTip';
        tempNode.title = `label.${type}`;
        tempNode.pNodeId = currentNode.nodeId;
        currentNode.child = tempNode;
        this.activeId = tempNode.nodeId;
        console.log(this.nodeInfo);
    }

    /**
     * 置换优先级
     * @param nodeId
     * @param type
     */
    private changeLevel(nodeId: string, type: ConditionDirectionEnum) {
        const pNode = TreeUtil.findParentNodeById(this.nodeInfo, nodeId);
        const idx = pNode.conditionNode.findIndex(item => item.nodeId === nodeId);
        if (type === ConditionDirectionEnum.left) {
            const prevNode = pNode.conditionNode[idx - 1];
            pNode.conditionNode[idx - 1] = pNode.conditionNode[idx];
            pNode.conditionNode[idx] = prevNode;
        } else {
            const prevNode = pNode.conditionNode[idx + 1];
            pNode.conditionNode[idx + 1] = pNode.conditionNode[idx];
            pNode.conditionNode[idx] = prevNode;
        }
        this.activeId = this.activeId === pNode.nodeId ? pNode.conditionNode[idx].nodeId : pNode.nodeId;
    }

    /**
     * 删除条件
     * @param nodeId
     */
    private deleteCondition(nodeId: string) {
        const pNode = TreeUtil.findParentNodeById(this.nodeInfo, nodeId);
        // 如果条件大于两个 则删除该条件 否则直接删除整个条件
        if (pNode.conditionNode.length > INIT_NODE_NUM) {
            pNode.conditionNode.splice(pNode.conditionNode.findIndex(item => item.nodeId === nodeId), 1);
            this.activeId = this.activeId === pNode.conditionNode[pNode.conditionNode.length - 1].nodeId ?
                this.nodeInfo.nodeId : pNode.conditionNode[pNode.conditionNode.length - 1].nodeId;
        } else {
            const gNode = TreeUtil.findParentNodeById(this.nodeInfo, pNode.nodeId);
            delete gNode.child;
            this.activeId = this.activeId === '' ? this.nodeInfo.nodeId : '';
        }
    }

    /**
     * 拷贝条件
     * @param nodeId
     */
    private copyCondition(nodeId: string) {
        const pNode = TreeUtil.findParentNodeById(this.nodeInfo, nodeId);
        // 源条件
        const sourceConditionIdx = pNode.conditionNode.findIndex(item => item.nodeId === nodeId);
        const targetCondition = _.cloneDeep(pNode.conditionNode[sourceConditionIdx]);
        TreeUtil.resetNodeId(targetCondition);
        pNode.conditionNode.splice(sourceConditionIdx, 0, targetCondition);
        this.activeId = targetCondition.nodeId;

    }

    /**
     * 新增条件
     * @param nodeId
     */
    private addCondition(nodeId: string) {
        const currentNode = TreeUtil.findNodeByProperties(this.nodeInfo, nodeId);
        const conditionNodeId = TreeUtil.getTreeId();
        currentNode.conditionNode.push({
            title: 'label.condition',
            name: 'label.conditionTip',
            level: currentNode.conditionNode.length - 1,
            nodeId: conditionNodeId,
            pNodeId: nodeId,
            type: NodeTypeEnum.conditionItem
        });
        this.activeId = conditionNodeId;
    }

    private initData() {
        this.nodeInfo = {
            approved: '',
            name: 'label.startWithOrg',
            title: 'label.startWith',
            type: NodeTypeEnum.start,
            nodeId: TreeUtil.getTreeId()
        };
    }

    /**
     * 点击节点
     * @param nodeId
     * @param type
     */
    private clickNode(nodeId: string, type: NodeTypeEnum) {
        this.activeId = nodeId;
        const selectedNode = _.cloneDeep(TreeUtil.findNodeByProperties(this.nodeInfo, nodeId));
        // 不传子节点信息 避免数据太大
        delete selectedNode.child;
        switch (type) {
            case NodeTypeEnum.conditionItem:
                this.currentCondition = selectedNode;
                this.showCondition = true;
                break;
            // 审批和处理同一类型
            case NodeTypeEnum.approve:
            case NodeTypeEnum.handler:
                this.nodeOperaState = true;
                this.currentNodeInfo = selectedNode;
                break;
            default:
                break;
        }
    }

    /**
     * 保存条件
     */
    private onSaveCondition(condition: NodeModel) {
        this.showCondition = false;
        const curNode = TreeUtil.findNodeByProperties(this.nodeInfo, condition.nodeId);
        condition.child = curNode.child;
        Object.assign(curNode, condition);
        this.currentCondition = new NodeModel();
        this.activeId = '';
    }


    private onSaveNodeInfo(nodeInfo: NodeModel) {
        this.nodeOperaState = false;
        const updateNode = TreeUtil.findNodeByProperties(this.nodeInfo, nodeInfo.nodeId);
        nodeInfo.child = updateNode.child;
        Object.assign(updateNode, nodeInfo);
        this.currentNodeInfo = new NodeModel();
        this.activeId = '';
    }

    get collapse() {
        return this.$store.getters[SettingsGetterEnum.collapse];
    }
}
</script>

<style scoped lang="scss">
@import "./css/workflow-csss.scss";

.workflow-container {
    min-height: calc(#{$base-keep-alive-height} - 40px);
    max-height: calc(#{$base-keep-alive-height} - 40px);
    background-color: $workflow-background-color;
    overflow: scroll;
    position: relative;

    .opera-top {
        position: fixed;
        top: calc(#{$base-nav-height} + #{$base-tabs-height} + #{$base-padding} * 2);
        z-index: 3;
    }

    .workflow-operation-btn-container {
        @extend .opera-top;
        right: calc(#{$base-padding} * 2);

        .workflow-operation-btn {
            width: 90px;
            height: 36px;
        }
    }

    .workflow-zoom {
        @extend .opera-top;
        left: calc(#{$base-left-menu-width} + 40px);
        line-height: 40px;
        display: inline-flex;

        .current-zoom {
            display: inline-block;
            margin: 0 15px;
        }

        .zoom-btn {
            margin-top: 5px;
            width: 30px;
            height: 30px;
            border: 1px solid $line-color;
            text-align: center;
            line-height: 30px;
            border-radius: 5px;
            background-color: #fff;
            font-weight: bold;
            cursor: pointer;
        }

        &.close {
            left: calc(#{$base-left-menu-width-min} + 40px);
        }
    }

    .workflow-content {
        min-height: calc(#{$base-keep-alive-height} - 80px);
        display: inline-flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        min-width: 100%;
        padding: 40px 0;

        .node-container {
            min-width: 100%;;

            .start-container {
                display: inline-flex;
                flex-flow: column;
                justify-content: center;
                align-items: center;
                width: 100%;
                position: relative;
                margin-bottom: 36px;

                .start-node {
                    display: block;
                    width: 105px;
                    height: 40px;
                    text-align: center;
                    line-height: 40px;
                    background: #fff;
                    border: 1px solid #e4e7ee;
                    border-radius: 10px;
                }

                &:after {
                    content: " ";
                    position: absolute;
                    height: 36px;
                    width: 2px;
                    background-color: $line-color;
                    bottom: -36px;
                    left: 50%;
                }
            }


            .end-node {
                .end-node-point {
                    width: 20px;
                    height: 20px;
                    margin: auto;
                    border-radius: 50%;
                    background: #fff;
                    border: 2px solid #3f9cfb;
                }

                .end-node-text {
                    margin-top: 5px;
                    text-align: center;
                }
            }
        }
    }
}

</style>
