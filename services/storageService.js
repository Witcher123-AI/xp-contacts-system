/**
 * 本地存储服务 - 封装localStorage操作
 */

export const storageService = {
    /**
     * 从本地存储获取数据
     * @param {string} key - 存储键名
     * @param {any} defaultValue - 默认值
     * @returns {any} 存储的数据或默认值
     */
    get(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (error) {
            console.error('从本地存储获取数据失败:', error);
            return defaultValue;
        }
    },

    /**
     * 将数据保存到本地存储
     * @param {string} key - 存储键名
     * @param {any} value - 要存储的数据
     * @returns {boolean} 是否保存成功
     */
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('保存数据到本地存储失败:', error);
            return false;
        }
    },

    /**
     * 从本地存储删除数据
     * @param {string} key - 存储键名
     * @returns {boolean} 是否删除成功
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('从本地存储删除数据失败:', error);
            return false;
        }
    },

    /**
     * 清空本地存储
     * @returns {boolean} 是否清空成功
     */
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('清空本地存储失败:', error);
            return false;
        }
    }
};