import EventModel from "@/components-com/workflow/model/event.model";

export default class SequenceModel extends EventModel {
    /**
     * 起始事件id
     */
    sourceRef: string;
    /**
     * 终止事件id
     */
    targetRef: string;
    /**
     * 条件
     */
    conditionExpression?: { condition: string };
    /**
     * 指向task的id
     */
    nodeIdNext: string;
}
