import ConditionModel from "@/components-com/workflow/model/condition.model";
import {ConditionRelationEnum} from "@/components-com/workflow/enums/node.enum";

export default class ConditionListModel {
    conditionList: ConditionModel[];
    opera: ConditionRelationEnum;
    subCondition?: ConditionListModel[];


    constructor(conditionList: ConditionModel[] = [], opera: ConditionRelationEnum = ConditionRelationEnum.or, subCondition: ConditionListModel[] = []) {
        this.conditionList = conditionList;
        this.opera = opera;
        this.subCondition = subCondition;
    }
}