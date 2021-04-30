import WorkflowModel from "@/components-com/workflow/model/workflow.model";
import ResponseModel from "@/common/model/response.model";
import Service from "@/common/service/service";
import {GET_WORKFLOW_URL, SAVE_WORKFLOW_URL} from "@/components-com/workflow/const/api.const";

/**
 * 工作流接口服务
 */
export default class WorkflowService {

    /**
     * 保存工作流信息
     * @param data
     */
    public static saveWorkflow(data: WorkflowModel): Promise<ResponseModel> {
        return Service.post(SAVE_WORKFLOW_URL, data);
    };

    /**
     * 获取工作流信息
     */
    public static getWorkflow(id: string): Promise<ResponseModel<WorkflowModel>> {
        return Service.get(GET_WORKFLOW_URL, id);
    };
}