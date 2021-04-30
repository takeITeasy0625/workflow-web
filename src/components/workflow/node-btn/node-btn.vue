<template>
    <div class="node-btn-container">
        <div class="btn-container">
            <div class="node-btn-container">
                <div class="btn-container">
                    <el-popover
                        v-model="approverState"
                        placement="right"
                        width="300"
                        popper-class="workflow-popover"
                        trigger="click">
                        <a class="approve-item" @click.stop="onClickAdd('approve')">
                            <div class="approve-item-icon approve">
                                <i class="el-icon-s-check approve-item-icon-content"/>
                            </div>
                            <div class="approve-item-text">
                                {{ $i18n.t('label.approve') }}
                            </div>
                        </a>
                        <a class="approve-item" @click.stop="onClickAdd('handler')">
                            <div class="approve-item-icon handler">
                                <i class="el-icon-edit approve-item-icon-content"/>
                            </div>
                            <div class="approve-item-text">
                                {{ $i18n.t('label.handler') }}
                            </div>
                        </a>
                        <a class="approve-item" @click.stop="onClickAdd('cc')">
                            <div class="approve-item-icon cc">
                                <i class="el-icon-s-promotion approve-item-icon-content"/>
                            </div>
                            <div class="approve-item-text">
                                {{ $i18n.t('label.cc') }}
                            </div>
                        </a>
                        <a class="approve-item" @click.stop="onClickAdd('condition')">
                            <div class="approve-item-icon condition">
                                <vab-icon icon="organization-chart" class="approve-item-icon-content"/>
                            </div>
                            <div class="approve-item-text">
                                {{ $i18n.t('label.condition') }}
                            </div>
                        </a>
                        <el-button icon="el-icon-plus"
                                   class="add-btn"
                                   size="mini"
                                   circle
                                   slot="reference"/>
                    </el-popover>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import _ from 'lodash';
import {EventTypeEnum} from "@/components-com/workflow/enums/node.enum";
import {DEBOUNCE_TIME} from "@/components-com/workflow/const/workflow.const";

@Component({components: {}})
export default class NodeBtn extends Vue {
    
    /*节点id*/
    @Prop()
    private nodeId: string;
    /*弹出层状态*/
    private approverState = false;
    
    /*新增*/
    private onClickAdd(type: string) {
        _.debounce(() => {
            this.approverState = false;
            this.$bus.$emit(EventTypeEnum.addNode, {type, nodeId: this.nodeId});
        }, DEBOUNCE_TIME).call()
    }
}
</script>

<style lang="scss">
@import "../css/workflow-csss.scss";

.node-btn-container {
    position: relative;
    width: $node-width;
    
    &:before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: -1;
        margin: auto;
        width: 2px;
        height: 100%;
        background-color: $line-color;
    }
    
    .btn-container {
        user-select: none;
        width: $node-width;
        padding: 20px 0 20px;
        display: flex;
        justify-content: center;
        flex-shrink: 0;
        flex-grow: 1;
        
        .add-btn {
            width: 30px;
            min-width: 30px;
            height: 30px;
            background-color: #fff;
            color: $blue-color;
            border: none;
            font-size: 16px;
            font-weight: 800;
            
            &:hover {
                background-color: $blue-color;
                color: #fff;
            }
        }
    }
}

.el-popover.el-popper.workflow-popover {
    border: 1px solid #eee;
    box-shadow: 0 3px 12px 0 rgba(96, 96, 96, 0.16);
    border-radius: 10px;
    padding: 14px 20px;
    
    .approve-item {
        display: inline-block;
        margin-left: 30px;
        cursor: pointer;
        
        &:first-of-type {
            margin-left: 0;
        }
        
        
        .approve-item-icon {
            width: 40px;
            height: 40px;
            border: 1px solid;
            border-radius: 50%;
            line-height: 40px;
            text-align: center;
            
            &.approve {
                color: #f17e35;
                
                &:hover {
                    background-color: #fff5ee;
                }
            }
            
            &.cc {
                color: #15BC83;
                
                &:hover {
                    background-color: #edfdf8;
                }
            }
            
            &.handler {
                color: #3f9cfb;
                
                &:hover {
                    background-color: #edfdf8;
                }
            }
            
            &.condition {
                color: #3f9cfb;
                
                &:hover {
                    background-color: #edfdf8;
                }
            }
            
            .approve-item-icon-content {
                font-size: 22px;
            }
        }
        
        .approve-item-text {
            display: inline-block;
            color: #999;
            margin-top: 7px;
            width: 100%;
            text-align: center;
        }
    }
}


</style>
