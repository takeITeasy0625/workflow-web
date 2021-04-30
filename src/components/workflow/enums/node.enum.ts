/**
 * 节点类型枚举
 */
export enum NodeTypeEnum {
    // 开始
    start = 'start',
    // 审批
    approve = 'approve',
    // 抄送
    cc = 'cc',
    // 办理
    handler = 'handler',
    // 条件
    condition = 'condition',
    // 条件节点
    conditionItem = 'conditionItem'
}

/**
 * 切换条件优先级
 */
export enum ConditionDirectionEnum {
    left = 'left',
    right = 'right'
}

/**
 * 事件类型枚举
 */
export enum EventTypeEnum {
    // 新增节点
    addNode = 'add-node',
    // 点击节点
    clickNode = 'click-node',
    // 删除节点
    deleteNode = 'delete-node',
    // 修改优先级
    changeLevel = 'change-level',
    // 复制条件
    copyCondition = 'copy-condition',
    // 删除条件
    deleteCondition = 'delete-condition',
    // 新增条件
    addCondition = 'add-condition'
}

/**
 * 倍数枚举
 */
export enum ZoomEnum {
    default = 100,
    min = 50,
    max = 300
}

/**
 * 条件操作区域
 */
export enum ConditionTypeEnum {
    // 等于
    eq = '==',
    // 大于
    gt = '>',
    // 小于
    lt = '<',
    // 大于等于
    gq = '>=',
    // 小于等于
    lq = '<='
}

/**
 * 条件之间的关系
 */
export enum ConditionRelationEnum {
    and = 'and',
    or = 'or'
}

/**
 * 审批类型
 */
export enum ApproveTypeEnum {
    multipleApprove = 'multiple',
    singleApprove = 'single'
}

/**
 * 多人审批类型
 */
export enum MultipleApproveTypeEnum {
    orSign = 'orSign',
    andSign = 'andSign',
    selectSign = 'selectSign'
}

/**
 * 通过后操作
 */
export enum SelectApprovePassedEnum {
    noticeStart = 'noticeStart',
    noticeNext = 'noticeNext',
}

/**
 * 通过后操作
 */
export enum NoApproveEnum {
    toNextNode = 'toNextNode',
    toAdmin = 'toAdmin',
    keepCurrent = 'keepCurrent'
}
