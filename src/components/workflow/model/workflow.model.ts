/**
 * 后台工作流引擎使用数据模型
 */
import EventModel from "@/components-com/workflow/model/event.model";
import TaskModel from "@/components-com/workflow/model/task.model";
import SequenceModel from "@/components-com/workflow/model/sequence.model";
import GatewayModel from "@/components-com/workflow/model/gateway.model";

export default class WorkflowModel extends EventModel {
    /**
     * 流程名称
     */
    name: string;
    /**
     * 备注
     */
    documentation: string;
    /**
     * 开始事件
     */
    startEvent: EventModel;
    /**
     * 结束事件
     */
    endEvent: EventModel;

    taskList: TaskModel[];

    sequenceList: SequenceModel[];

    serviceTaskList: TaskModel[];
    /*网关列表*/
    gatewayList: GatewayModel[];

    constructor(id: string, name?: string, documentation?: string) {
        super(id);
        this.name = name;
        this.documentation = documentation;
    }
}