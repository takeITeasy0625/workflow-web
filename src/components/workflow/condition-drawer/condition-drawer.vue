<template>
    <el-drawer
        :visible="showCondition"
        :size="500"
        :append-to-body="true"
        :wrapper-closable="false"
        :destroy-on-close="true"
        custom-class="condition-box"
        :with-header="false"
        @open="onOpen"
        @closed="resetData"
        @close="onClose">
        <div class="workflow-drawer-title-container">
            <div class="title-info">
                {{ $i18n.t('label.conditionBoxTitle') }}
            </div>
        </div>
        <div class="workflow-drawer-middle-item-container">
            <div v-for="(subCondition,index) in subConditionList" v-bind:key="index">
                <div class="condition-group">
                    <div class="condition-item-title-container">
                        <div class="condition-item-title">
                            {{ $i18n.t('label.conditionGroup') }}
                        </div>
                        <div class="condition-item-opera">
                            <i class="el-icon-delete delete-btn"
                               v-if="subConditionList.length > 1"
                               @click="onDeleteConditionGroup(index)"/>
                        </div>
                    </div>
                    <el-row v-for="(item,idx) in subCondition.conditionList"
                            v-bind:key="idx"
                            class="condition-group-content">
                        <el-row class="condition-item">
                            <el-col :span="24" class="condition-item-input">
                                <el-input v-model="item.field" placeholder="请输入字段名" size="large"/>
                            </el-col>
                            <el-col :span="24" class="condition-item-input">
                                <el-select v-model="item.opera" placeholder="请选择" size="large" style="width:100%">
                                    <el-option
                                        v-for="item in conditionOptions"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value">
                                    </el-option>
                                </el-select>
                            </el-col>
                            <el-col :span="24" class="condition-item-input">
                                <el-input v-model="item.value" placeholder="请输入值" size="large"/>
                            </el-col>
                        </el-row>
                        <el-row v-if="idx <= subCondition.conditionList.length - 2" class="item-divider-container">
                            <el-col :span="23">
                                <div class="item-divider">且(AND)</div>
                            </el-col>
                            <el-col :span="1">
                                <i class="el-icon-remove-outline delete-btn" @click="onDeleteCondition(index,idx)"/>
                            </el-col>
                        </el-row>
                    </el-row>
                    <el-row class="btn-container">
                        <el-button type="text" icon="el-icon-circle-plus-outline" @click="onAddCondition(index)">
                            {{ $i18n.t('label.addCondition') }}
                        </el-button>
                    </el-row>
                </div>
                <div class="group-line">
                    <el-divider v-if="index <= subConditionList.length - 2">或(OR)</el-divider>
                </div>
            </div>
            
            <el-row class="add-group-btn-container">
                <el-button type="primary" plain icon="el-icon-circle-plus-outline" @click="onAddSubCondition"
                           size="medium">
                    {{ $i18n.t('label.addConditionGroup') }}
                </el-button>
            </el-row>
        </div>
        <div class="workflow-drawer-bottom-container">
            <el-button @click.stop="onClose" size="medium">{{ $i18n.t('button.cancel') }}</el-button>
            <el-button type="primary" @click="onSave" size="medium">{{ $i18n.t('button.sure') }}</el-button>
        </div>
    </el-drawer>
</template>

<script lang="ts">
import {Component, Emit, Prop, Vue} from "vue-property-decorator";
import NodeModel from "../model/node.model";
import ConditionListModel from "../model/condition-list.model";
import ConditionModel from "../model/condition.model";
import OptionModel from "@/common/model/option.model";
import {ConditionTypeEnum} from "../enums/node.enum";
import TreeUtil from "../util/tree-util";

@Component({components: {}})
export default class ConditionDrawer extends Vue {
    @Prop({default: false})
    private showCondition: boolean;
    
    @Prop()
    private conditionNode: NodeModel;
    private localConditionNode: NodeModel = new NodeModel();
    /* 条件类型选项 */
    private conditionOptions: OptionModel[];
    /*条件类型*/
    private conditionType = ConditionTypeEnum;
    private subConditionList: ConditionListModel[] = [];
    
    /**
     * 打开时赋值
     */
    private onOpen() {
        this.localConditionNode = _.cloneDeep(this.conditionNode);
        if (this.localConditionNode.condition) {
            // 判断条件是否有多层嵌套
            if (!_.isEmpty(this.localConditionNode.condition.subCondition)) {
                this.subConditionList = this.localConditionNode.condition.subCondition;
            } else {
                // 没有多层直接将条件放在子条件中
                const subCondition = new ConditionListModel();
                subCondition.conditionList = this.localConditionNode.condition.conditionList;
                this.subConditionList.push(subCondition);
            }
        } else {
            // 没有条件初始化一个
            this.subConditionList = [this.addNewConditionGroup()];
        }
    }
    
    /**
     * 初始化条件选项
     */
    private created() {
        this.conditionOptions = Object.keys(this.conditionType).map(item => {
            return {
                label: this.$i18n.t(`label.${item}`) as string,
                value: this.conditionType[item]
            };
        })
    }
    
    /**
     * 删除条件
     */
    private onDeleteCondition(index: number, idx: number) {
        this.subConditionList[index].conditionList.splice(idx, 1);
    }
    
    /**
     * 删除条件组
     */
    private onDeleteConditionGroup(index: number) {
        this.subConditionList.splice(index, 1);
    }
    
    /**
     * 返回条件数据
     */
    @Emit()
    private onSave(): NodeModel {
        // 如果条件只有一个说明条件本身只有and 合并and到外层
        if (this.subConditionList.length === 1) {
            const conditionListModel = new ConditionListModel();
            conditionListModel.conditionList = this.subConditionList[0].conditionList;
            this.localConditionNode.condition = conditionListModel;
        } else {
            this.localConditionNode.condition = new ConditionListModel();
            this.localConditionNode.condition.subCondition = this.subConditionList;
        }
        this.localConditionNode.name = TreeUtil.getCondition(this.localConditionNode.condition);
        const data = _.cloneDeep(this.localConditionNode);
        this.resetData();
        return data;
    }
    
    /**
     * 新增条件
     */
    private onAddCondition(index: number) {
        this.subConditionList[index].conditionList.push(new ConditionModel());
    }
    
    
    /**
     * 新增一个空的条件
     */
    private addNewConditionGroup(): ConditionListModel {
        const conditionListModel = new ConditionListModel();
        conditionListModel.conditionList = [new ConditionModel()];
        return conditionListModel;
    }
    
    /**
     * 新增条件组
     */
    private onAddSubCondition() {
        this.subConditionList.push(this.addNewConditionGroup())
    }
    
    /**
     * 返回条件数据
     */
    @Emit()
    private onClose() {
    }
    
    /**
     * 重置数据
     */
    private resetData() {
        this.localConditionNode = new NodeModel();
        this.subConditionList = [];
    }
}
</script>

<style scoped lang="scss">
@import "../css/workflow-csss";

.condition-box {
    position: relative;
    
    
    .condition-title-input {
        display: none;
        
        &.edit {
            display: block;
        }
    }
    
    .workflow-drawer-middle-item-container {
        .condition-group {
            width: 460px;
            border: 1px solid #eee;
            box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
            
            .condition-item-title-container {
                display: flex;
                justify-content: space-between;
                background: $workflow-background-color;
                padding: 16px 30px;
                margin-bottom: 20px;
                
                .condition-item-title {
                    font-size: 16px;
                    font-weight: bold;
                    color: $title-color;
                }
                
                .condition-item-opera {
                    color: #f56c6c;
                    cursor: pointer;
                }
            }
            
            .condition-group-content {
                padding: 0 30px;
                
                .condition-item-input {
                    margin-bottom: 15px;
                }
                
                .item-divider-container {
                    font-size: 16px;
                    margin: 15px 0;
                    
                    .item-divider {
                        color: $title-color;
                    }
                    
                    .delete-btn {
                        color: #f56c6c;
                        cursor: pointer;
                    }
                }
            }
            
            .btn-container {
                padding-left: 30px;
                margin-bottom: 15px;
            }
        }
        
        .group-line {
            margin: 30px 0;
            color: $title-color;
            font-size: 16px;
            font-weight: 400;
        }
    }
    
    .add-group-btn-container {
        margin-top: 30px;
    }
}
</style>
