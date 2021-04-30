import {ApproveTypeEnum, MultipleApproveTypeEnum, NodeTypeEnum} from "@/components-com/workflow/enums/node.enum";
import ConditionListModel from "@/components-com/workflow/model/condition-list.model";

export default class NodeModel {
    nodeId: string;

    type: NodeTypeEnum;

    title: string;

    name: string;

    approved?: string;

    // 审批类型
    approveType?: ApproveTypeEnum;
    multipleApprove?: MultipleApproveTypeEnum;

    level?: number;

    // 下一个节点
    child?: NodeModel;

    // 条件节点
    conditionNode?: NodeModel[];

    // 条件
    condition?: ConditionListModel;

    // 是否为默认分支节点 其他条件不生效时默认走该分支
    default?:boolean;

    pNodeId?: string;
}
