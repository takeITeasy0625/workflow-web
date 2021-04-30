import {ConditionTypeEnum} from "@/components-com/workflow/enums/node.enum";


/**
 * 条件模型
 */
export default class ConditionModel {
    /**
     * 字段
     */
    field: string;
    /**
     * 操作符
     */
    opera: ConditionTypeEnum;
    /**
     * 值
     */
    value: string | number;
}