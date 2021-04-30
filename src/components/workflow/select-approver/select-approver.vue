<template>
    <el-dialog
        title="选择审批人"
        :visible="showSelectApproverStatus"
        @close="onClose"
        append-to-body>
    </el-dialog>
</template>

<script lang="ts">
import {Component, Emit, Prop, Vue} from "vue-property-decorator";

@Component({})
export default class SelectApprover extends Vue {
    @Prop({default: false})
    private showSelectApproverStatus: boolean;
    
    
    @Emit()
    private onClose() {
    }
}
</script>

<style scoped>

</style>
