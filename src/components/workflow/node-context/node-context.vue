<template>
    <div class="workflow-node">
        <div class="branch-container" v-if="node && node.type==='condition' && node.conditionNode.length > 0">
            <div class="branch-main">
                <div class="branch-box-container">
                    <div class="add-btn" @click.stop="onAddCondition(node.nodeId)"><i class="el-icon-plus btn-icon"/>
                    </div>
                    <div class="condition-col" v-for="(item,index) in node.conditionNode" v-bind:key="item.nodeId">
                        <div v-if="index === 0"
                             class="cover-line"
                             :class="{'left-top':index===0}"></div>
                        <div v-if="index === 0"
                             class="cover-line"
                             :class="{'left-bottom':index===0}"></div>
                        
                        <div v-if="index === node.conditionNode.length - 1"
                             class="cover-line"
                             :class="{'right-top':index===node.conditionNode.length - 1}"></div>
                        <div
                            v-if="index === node.conditionNode.length - 1"
                            class="cover-line"
                            :class="{'right-bottom':index===node.conditionNode.length - 1}"></div>
                        <div class="condition-box-outer">
                            <div class="condition-box-inner">
                                <div class="condition-box"
                                     @click.stop="onClick(item.nodeId,item.type)"
                                     :class="{selected:item.nodeId === activeId}">
                                    <div class="condition-move left" v-if="index>0">
                                        <i class="el-icon-arrow-left"
                                           @click.stop="changeLevel(item.nodeId,'left')"/>
                                    </div>
                                    <div class="condition-move right" v-if="index < node.conditionNode.length - 1">
                                        <i class="el-icon-arrow-right"
                                           @click.stop="changeLevel(item.nodeId, 'right')"/>
                                    </div>
                                    <div class="condition-title-container">
                                        <div class="condition-title-info">
                                            {{ `${$i18n.t(item.title)}${index + 1}` }}
                                        </div>
                                        <div class="condition-level-info">
                                            {{ `${$i18n.t('label.conditionLevel')}${index + 1}` }}
                                        </div>
                                        <div class="condition-opera-container">
                                            <i class="el-icon-document-copy opera-icon"
                                               @click.stop="onCopy(item.nodeId)"/>
                                            <i class="el-icon-close opera-icon"
                                               @click.stop="onDeleteCondition(item.nodeId)"/>
                                        </div>
                                    </div>
                                    <div class="condition-content">
                                        {{ $i18n.te(item.name) ? $i18n.t(item.name) : item.name }}
                                    </div>
                                </div>
                            </div>
                            <node-btn :node-id="item.nodeId" style="margin-left: 50px"/>
                        </div>
                        <node-context v-if="item.child && item.child.nodeId" :node="item.child" :active-id="activeId"/>
                    </div>
                </div>
                <node-btn :node-id="node.nodeId"/>
            </div>
        </div>
        <div class="node-wrapper-container" v-if="node && node.type !== 'condition'">
            <div class="node-box"
                 :class="{arrow : addArrow, selected:node.nodeId === activeId ,[node.type]:node.type}"
                 @click.stop="onClick(node.nodeId, node.type)">
                <div class="node-title">
                    <div class="node-title-icon-container">
                        <i class="node-title-icon"
                           :class="{'el-icon-s-promotion':node.type==='cc',
                                'el-icon-s-check':node.type==='approve',
                                'el-icon-user-solid':node.type==='start',
                                'el-icon-document-checked':node.type === 'handler'}"/>
                    </div>
                    
                    <div class="node-title-content">
                        {{ $i18n.te(node.title) ? $i18n.t(node.title) : node.title }}
                    </div>
                    <i class="el-icon-close node-close"
                       @click.stop="onClose(node.nodeId)"
                       v-if="node.type !== 'start'"/>
                </div>
                <div class="node-content">
                    <div class="node-content-text">
                        {{ $i18n.te(node.name) ? $i18n.t(node.name) : node.name }}
                    </div>
                </div>
            </div>
            <node-btn :node-id="node.nodeId"/>
        </div>
        <node-context v-if="node && node.child && node.child.nodeId!== undefined"
                      :active-id="activeId"
                      :node="node.child"
                      @on-click="onClick(node.child.nodeId, node.child.type)"
                      @on-close="onClose((node.child.nodeId))"/>
    </div>
</template>

<script lang="ts">
import NodeModel from "../model/node.model";
import NodeBtn from '../node-btn/node-btn'
import {Prop, Component, Vue} from "vue-property-decorator";
import {ConditionDirectionEnum, EventTypeEnum, NodeTypeEnum} from "../enums/node.enum";
import _ from 'lodash';
import {DEBOUNCE_TIME} from "@/components-com/workflow/const/workflow.const";

@Component({name: 'NodeContext', components: {NodeBtn}})
export default class NodeContext extends Vue {
    /**
     * 节点信息
     */
    @Prop()
    private node: NodeModel;
    
    /**
     * 当前激活节点信息
     */
    @Prop()
    private activeId: string;
    
    private onClose(nodeId: string) {
        _.debounce(() => {
            this.$bus.$emit(EventTypeEnum.deleteNode, nodeId);
        }, DEBOUNCE_TIME).call();
    }
    
    private onClick(nodeId: string, type: NodeTypeEnum) {
        _.debounce(() => {
            this.$bus.$emit(EventTypeEnum.clickNode, {nodeId, type});
        }, DEBOUNCE_TIME).call();
    }
    
    private changeLevel(nodeId: string, type: ConditionDirectionEnum) {
        _.debounce(() => {
            this.$bus.$emit(EventTypeEnum.changeLevel, {nodeId, type});
        }, DEBOUNCE_TIME).call();
    }
    
    private onCopy(nodeId: string) {
        _.debounce(() => {
            this.$bus.$emit(EventTypeEnum.copyCondition, nodeId);
        }, DEBOUNCE_TIME).call();
    }
    
    private onDeleteCondition(nodeId: string) {
        _.debounce(() => {
            this.$bus.$emit(EventTypeEnum.deleteCondition, nodeId);
        }, DEBOUNCE_TIME).call();
    }
    
    
    private onAddCondition(nodeId: string) {
        _.debounce(() => {
            this.$bus.$emit(EventTypeEnum.addCondition, nodeId);
        }, DEBOUNCE_TIME).call();
    }
    
    get addArrow() {
        return this.node.type !== NodeTypeEnum.start;
    }
}
</script>

<style scoped lang="scss">
@import "../css/workflow-csss.scss";

.workflow-node {
    .node-wrapper-container {
        box-sizing: border-box;
        display: inline-flex;
        flex-flow: column;
        justify-content: center;
        align-items: center;
        width: 100%;
        
        .node-box {
            cursor: pointer;
            width: $node-width;
            position: relative;
            border-radius: 10px;
            border: 1px solid rgba(0, 0, 0, 0);
            box-shadow: 0 3px 12px 0 rgba(96, 96, 96, 0.16);
            
            &.arrow:before {
                content: '';
                position: absolute;
                top: -17px;
                left: calc(50% - 5px);
                width: 10px;
                height: 10px;
                background-color: #C0C4CC;
                border-radius: 50%;
                border: 1px solid #E4E7EE;
            }
            
            &.start {
                .node-title {
                    border-radius: 10px 10px 0 0;
                    
                    .node-title-icon-container {
                        background-color: #c0c4cc;
                    }
                }
                
            }
            
            &.approve {
                border-top: 5px solid #f17e35;
                
                .node-title-icon-container {
                    background-color: #f17e35;
                }
            }
            
            &.handler {
                border-top: 5px solid #3F9CFB;
                
                .node-title-icon-container {
                    background-color: #3F9CFB;
                }
            }
            
            &.cc {
                border-top: 5px solid #15BC83;
                
                .node-title-icon-container {
                    background-color: #15BC83;
                }
            }
            
            &:hover, &.selected {
                border-left: 1px solid #1890ff;
                border-right: 1px solid #1890ff;
                border-bottom: 1px solid #1890ff;
                
                &.start {
                    border-top: 1px solid #1890ff;
                }
                
                .node-title .node-close {
                    visibility: unset;
                    
                }
            }
            
            .node-title {
                background-color: #fff;
                height: 50px;
                line-height: 24px;
                padding-left: 16px;
                padding-top: 6px;
                display: flex;
                align-items: center;
                width: 100%;
                border-bottom: 1px solid #F5F5F7;
                
                .node-title-icon-container {
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    line-height: 30px;
                    font-size: 16px;
                    text-align: center;
                    color: #fff;
                }
                
                .node-title-content {
                    width: 75%;
                    margin-left: 7px;
                    font-size: 16px;
                    font-weight: bold;
                    color: #606266;
                }
                
                .node-close {
                    visibility: hidden;
                    
                    &:hover {
                        transform: scale(1.5);
                    }
                }
            }
            
            .node-content {
                font-size: 14px;
                padding: 16px 16px 16px 16px;
                background-color: #fff;
                border-radius: 0 0 10px 10px;
                
                .node-content-text {
                    display: inline-block;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    width: 90%;
                }
                
                .node-content-icon {
                    font-size: 14px;
                    transform: translateY(-20%);
                }
            }
        }
    }
    
    .branch-container {
        display: inline-flex;
        width: 100%;
        
        .branch-main {
            display: flex;
            flex-direction: column;
            flex-wrap: wrap;
            align-items: center;
            min-height: 270px;
            width: 100%;
            flex-shrink: 0;
            
            .branch-box-container {
                display: flex;
                overflow: visible;
                min-height: 180px;
                height: auto;
                border-bottom: 2px solid $line-color;
                border-top: 2px solid $line-color;
                position: relative;
                margin-top: 15px;
                
                .add-btn {
                    color: #fff;
                    background: #c0c4cc;
                    position: absolute;
                    top: -16px;
                    left: calc(50% - 12.5px);
                    z-index: 1;
                    transform: rotate(45deg);
                    width: 25px;
                    height: 25px;
                    font-size: 22px;
                    text-align: center;
                    line-height: 25px;
                    cursor: pointer;
                    box-shadow: -2px 1px 10px 0px rgba(96, 96, 96, 0.2);
                    
                    .btn-icon {
                        transform: rotate(45deg);
                    }
                    
                }
                
                .condition-col {
                    display: inline-flex;
                    flex-direction: column;
                    align-items: center;
                    position: relative;
                    background-color: #f5f5f7;
                    
                    &:before {
                        content: "";
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        margin: auto;
                        width: 2px;
                        height: 100%;
                        background-color: $line-color;
                    }
                    
                    .cover-line {
                        position: absolute;
                        height: 3px;
                        width: 50%;
                        background-color: #f5f5f7;
                        
                        &.left-top {
                            top: -3px;
                            left: -1px;
                        }
                        
                        &.left-bottom {
                            bottom: -3px;
                            left: -1px;
                        }
                        
                        &.right-top {
                            top: -3px;
                            right: -1px;
                        }
                        
                        &.right-bottom {
                            bottom: -3px;
                            right: -1px;
                        }
                    }
                    
                    .condition-box-outer {
                        min-height: 180px;
                        display: inline-flex;
                        flex-direction: column;
                        
                        .condition-box-inner {
                            padding-top: 30px;
                            padding-right: 50px;
                            padding-left: 50px;
                            justify-content: center;
                            display: inline-flex;
                            align-items: center;
                            flex-direction: column;
                            flex-grow: 1;
                            position: relative;
                            
                            &:before {
                                content: "";
                                position: absolute;
                                top: 0;
                                left: 0;
                                right: 0;
                                bottom: 0;
                                margin: auto;
                                width: 2px;
                                height: 100%;
                                background-color: $line-color;
                            }
                            
                            .condition-box {
                                position: relative;
                                width: $node-width;
                                min-height: 80px;
                                background: #fff;
                                padding: 20px;
                                cursor: pointer;
                                border: 1px solid #fff;
                                border-radius: 12px;
                                box-shadow: 0 3px 12px 0 rgba(96, 96, 96, 0.16);
                                
                                .condition-move {
                                    position: absolute;
                                    display: inline-flex;
                                    align-items: center;
                                    height: 100%;
                                    top: 0;
                                    
                                    &.left {
                                        left: 0;
                                        border-right: 1px solid #f6f6f6;
                                        border-radius: 10px 0 0 10px;
                                    }
                                    
                                    &.right {
                                        border-left: 1px solid #f6f6f6;
                                        border-radius: 0 10px 10px 0;
                                        right: 0;
                                    }
                                    
                                    &:hover {
                                        background: #efefef;
                                        border-color: #191f2514;
                                    }
                                }
                                
                                &:hover, &.selected {
                                    border: 1px solid #1890ff;
                                    
                                    .condition-title-container {
                                        .condition-level-info {
                                            display: none;
                                        }
                                        
                                        .condition-opera-container {
                                            display: block;
                                        }
                                    }
                                    
                                }
                                
                                .condition-title-container {
                                    font-size: 12px;
                                    line-height: 17px;
                                    display: inline-flex;
                                    width: 100%;
                                    justify-content: space-between;
                                    margin-bottom: 18px;
                                    
                                    .condition-title-info {
                                        max-width: 120px;
                                        overflow: hidden;
                                        white-space: nowrap;
                                        text-overflow: ellipsis;
                                        color: #4B4B4B;
                                        font-size: 16px;
                                        font-weight: bold;
                                    }
                                    
                                    .condition-level-info {
                                        color: #c4c8d0;
                                    }
                                    
                                    .condition-opera-container {
                                        color: #c4c8d0;
                                        display: none;
                                        font-weight: bold;
                                        
                                        .opera-icon {
                                            margin-left: 5px;
                                            
                                            &:hover {
                                                transform: scale(1.5);
                                            }
                                        }
                                    }
                                }
                                
                                .condition-content {
                                    font-weight: 400;
                                    color: #3F9CFB;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
</style>
