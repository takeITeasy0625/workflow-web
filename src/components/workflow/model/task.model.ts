import EventModel from "@/components-com/workflow/model/event.model";
import {NodeTypeEnum} from "@/components-com/workflow/enums/node.enum";

/**
 * 任务信息
 */
export default class TaskModel extends EventModel {
    name: string;
    /**
     * 任务描述
     */
    documentation: string;

    /**
     * 任务分类
     */
    category: NodeTypeEnum;

    /**
     * 是否多实例
     */
    multiIns?: boolean;

    /**
     * 是否候选用户组（或签）
     */
    candidate?: boolean;

    delegateExpression: string;

    constructor(id?: string, name?: string) {
        super(id);
        this.name = name;
    }
}
