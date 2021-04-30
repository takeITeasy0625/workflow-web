/**
 * 事件模型
 */
export default class EventModel {
    /**
     * id必填
     */
    public id: string;

    /**
     * 构造方法
     * @param id
     */
    constructor(id: string) {
        this.id = id;
    }
}
