<template>
    <div>
        <el-drawer
            :visible="showNodeOpera"
            :size="500"
            :append-to-body="true"
            :wrapper-closable="false"
            :destroy-on-close="true"
            custom-class="node-opera-box"
            :with-header="false"
            @open="onOpen"
            @closed="resetData"
            @close="onClose">
            <div class="workflow-drawer-title-container">
                <div class="title-info">
                    {{ $i18n.t('label.nodeConfig') }}
                </div>
            </div>
            <div class="workflow-drawer-middle-item-container">
                <el-form ref="nodeForm" label-position="top" :model="localNodeInfo">
                    <el-form-item>
                        <span slot="label" class="item-label">{{ $i18n.t('label.nodeName') }}</span>
                        <el-input v-model="localNodeInfo.title"/>
                    </el-form-item>
                    <el-form-item>
                        <span slot="label" class="item-label">{{ $i18n.t('label.approveType') }}</span>
                        <el-select v-model="localNodeInfo.approveType"
                                   :placeholder="$i18n.t('label.selectPlaceholder')"
                                   class="item-select"
                                   v-if="approveTypeOptions">
                            <el-option
                                v-for="item in approveTypeOptions"
                                :key="item.value"
                                :label="$i18n.t('label.'+item.label)"
                                :value="item.value">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item v-if="localNodeInfo.approveType === approveType.multipleApprove">
                        <span slot="label" class="item-label">{{ $i18n.t('label.multipleApprove') }}</span>
                        <el-checkbox-group v-model="selectMultipleApproveList"
                                           size="medium"
                                           :max="1"
                                           @change="onSelectMultipleApproveType">
                            <el-checkbox v-for="item in multipleApproveType"
                                         :label="$i18n.t('label.'+item.label)"
                                         :key="item.value"/>
                        </el-checkbox-group>
                    </el-form-item>
                    <el-form-item>
                        <span slot="label" class="item-label">{{ $i18n.t('label.approver') }}</span>
                        <el-button icon="el-icon-circle-plus" @click="selectApproverState = true">
                            {{ $i18n.t('label.selectApprover') }}
                        </el-button>
                    </el-form-item>
                    <el-form-item>
                        <span slot="label" class="item-label">{{ $i18n.t('label.approvePassed') }}</span>
                        <el-checkbox-group v-model="selectApprovePassedList"
                                           :max="2"
                                           @change="onSelectApprovePassed"
                                           size="medium">
                            <el-checkbox v-for="item in selectApprovePassedOptions"
                                         :label="$i18n.t('label.'+item.label)"
                                         :key="item.value"/>
                        </el-checkbox-group>
                    </el-form-item>
                    <el-form-item>
                        <span slot="label" class="item-label">{{ $i18n.t('label.approveRejected') }}</span>
                        <el-checkbox :label="$i18n.t('label.noticeStart')"
                                     :key="true"/>
                    </el-form-item>
                    <el-form-item>
                        <span slot="label" class="item-label">{{ $i18n.t('label.nodeHasNotApprover') }}</span>
                        <el-radio-group v-model="noApproverRadio" size="medium">
                            <el-radio v-for="item in noApproverOptions" :key="item.value" :label="item.value"
                                      class="radio-line">
                                {{ $i18n.t('label.' + item.label) }}
                            </el-radio>
                        </el-radio-group>
                    </el-form-item>
                    
                    <el-form-item>
                        <span slot="label" class="item-label">{{ $i18n.t('label.jumpNodeTip') }}</span>
                        <el-checkbox :label="$i18n.t('label.jumpNode')"
                                     :key="true"/>
                    </el-form-item>
                    
                    <el-form-item>
                        <span slot="label" class="item-label">{{ $i18n.t('label.updateFormTip') }}</span>
                        <el-checkbox :label="$i18n.t('label.updateForm')"
                                     :key="true"/>
                    </el-form-item>
                
                </el-form>
            </div>
            <div class="workflow-drawer-bottom-container">
                <el-button @click.stop="onClose" size="medium">{{ $i18n.t('button.cancel') }}</el-button>
                <el-button type="primary" @click="onSave" size="medium">{{ $i18n.t('button.sure') }}</el-button>
            </div>
            <select-approver :show-select-approver-status="selectApproverState" @close="selectApproverState = false"/>
        </el-drawer>
    </div>

</template>

<script lang="ts">
import {Component, Emit, Prop, Vue} from "vue-property-decorator";
import NodeModel from "../model/node.model";
import {ElForm} from "element-ui/types/form";
import {ApproveTypeEnum, MultipleApproveTypeEnum, NoApproveEnum, SelectApprovePassedEnum} from "../enums/node.enum";
import OptionModel from "@/common/model/option.model";
import SelectApprover from '../select-approver/select-approver';

/**
 * 节点操作抽屉
 */
@Component({components: {SelectApprover}})
export default class NodeOperaDrawer extends Vue {
    /*抽屉状态*/
    @Prop({default: false})
    private showNodeOpera: boolean;
    
    /*节点信息*/
    @Prop()
    private nodeInfo: NodeModel;
    
    /*发射关闭事件*/
    @Emit()
    private onClose() {
    }
    
    /*保存*/
    @Emit()
    private onSave() {
        return this.localNodeInfo;
    }
    
    /*审批人选择器状态*/
    private selectApproverState = false;
    /*引用子组价声明*/
    private $refs: { nodeForm: ElForm };
    /*组件内部使用节点信息*/
    private localNodeInfo = new NodeModel();
    /*审批类型*/
    private approveType = ApproveTypeEnum;
    /*审批类型复选框*/
    private approveTypeOptions: OptionModel[] = [];
    /*多人审批类型*/
    private multipleApproveType: OptionModel[] = [];
    /*选择多选类型*/
    private selectMultipleApproveList: MultipleApproveTypeEnum[] = [];
    /*通过后操作*/
    private selectApprovePassedList: SelectApprovePassedEnum[] = [];
    /*通过后操作选项*/
    private selectApprovePassedOptions: OptionModel[] = [];
    /*没有审批人时选项*/
    private noApproverRadio: NoApproveEnum = NoApproveEnum.toNextNode;
    /*通过后操作选项*/
    private noApproverOptions: OptionModel[] = [];
    
    /**
     * 打开抽屉时将传入值赋值给本地变量
     */
    private onOpen() {
        this.localNodeInfo = _.cloneDeep(this.nodeInfo);
        //翻译文字
        if (this.$i18n.te(this.localNodeInfo.title)) {
            this.localNodeInfo.title = this.$i18n.t(this.localNodeInfo.title) as string;
        }
        // 初始化审批下拉选择
        if (!this.approveTypeOptions.length) {
            this.approveTypeOptions = Object.keys(this.approveType).map(item => {
                return {label: item, value: this.approveType[item]};
            });
        }
        // 多人审批复选框
        if (!this.multipleApproveType.length) {
            this.multipleApproveType = Object.keys(MultipleApproveTypeEnum).map(item => {
                return {label: item, value: MultipleApproveTypeEnum[item]};
            });
        }
        // 通过后操作选项
        if (!this.selectApprovePassedOptions.length) {
            this.selectApprovePassedOptions = Object.keys(SelectApprovePassedEnum).map(item => {
                return {label: item, value: SelectApprovePassedEnum[item]};
            });
        }
        // 没有审批人操作选项
        if (!this.noApproverOptions.length) {
            this.noApproverOptions = Object.keys(NoApproveEnum).map(item => {
                return {label: item, value: NoApproveEnum[item]};
            });
        }
    }
    
    /**
     * 关闭时重置数据
     */
    private resetData() {
        this.localNodeInfo = new NodeModel();
    }
    
    /**
     * 选择或签人模式
     */
    private onSelectMultipleApproveType(data: MultipleApproveTypeEnum[]) {
        this.localNodeInfo.multipleApprove = data[0];
    }
    
    /**
     * 选择审批后操作
     */
    private onSelectApprovePassed(data: SelectApprovePassedEnum[]) {
    
    }
    
    /**
     * 无审批人时选项
     */
    private onSelectNoApprover(data: NoApproveEnum[]) {
    
    }
}
</script>

<style lang="scss">
@import "../css/workflow-csss.scss";

.node-opera-box {
    .workflow-drawer-middle-item-container {
        .item-label {
            font-weight: bold;
            font-size: 14px;
            color: $title-color;
        }
        
        .item-select {
            width: 100%;
        }
        
        .radio-line {
            width: 100%;
            
            &:not(:last-of-type) {
                margin-bottom: 15px;
            }
        }
        
    }
}
</style>
