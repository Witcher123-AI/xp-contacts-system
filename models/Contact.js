/**
 * 联系人数据模型
 */
export class Contact {
    /**
     * 创建联系人实例
     * @param {string} id - 联系人ID
     * @param {string} name - 联系人姓名
     * @param {Array} methods - 联系方式列表
     * @param {string} note - 备注信息
     * @param {boolean} isFavorite - 是否收藏
     */
    constructor(id, name, methods = [], note = '', isFavorite = false) {
        this.id = id;
        this.name = name;
        this.methods = methods;
        this.note = note;
        this.isFavorite = isFavorite;
    }
}

/**
 * 创建新的联系人实例（自动生成ID）
 * @param {string} name - 联系人姓名
 * @param {Array} methods - 联系方式列表
 * @param {string} note - 备注信息
 * @param {boolean} isFavorite - 是否收藏
 * @returns {Contact} 新创建的联系人实例
 */
export function createContact(name, methods = [], note = '', isFavorite = false) {
    const id = Date.now().toString();
    return new Contact(id, name, methods, note, isFavorite);
}