/**
 * 导入导出服务 - 处理Excel文件的导入导出功能
 */
import { Contact } from '../models/Contact.js';

/**
 * 将联系人列表导出为Excel文件
 * @param {Array<Contact>} contacts - 要导出的联系人列表
 */
export function exportToExcel(contacts) {
    if (!contacts || contacts.length === 0) {
        alert('暂无联系人可导出');
        return;
    }
    
    // 准备导出数据
    const exportData = [['姓名', '电话', '邮箱', '微信', '地址', '备注', '是否收藏']];
    
    contacts.forEach(contact => {
        const row = [contact.name, '', '', '', '', contact.note, contact.isFavorite ? '是' : '否'];
        
        // 填充联系方式
        contact.methods.forEach(method => {
            const index = {
                phone: 1,
                email: 2,
                wechat: 3,
                address: 4
            }[method.type];
            if (index) {
                row[index] = method.value;
            }
        });
        
        exportData.push(row);
    });
    
    // 创建工作簿
    const ws = XLSX.utils.aoa_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '联系人列表');
    
    // 导出文件
    XLSX.writeFile(wb, '通讯录.xlsx');
}

/**
 * 从Excel文件导入联系人
 * @param {File} file - 要导入的Excel文件
 * @returns {Promise<Array<Contact>>} 导入的联系人列表
 */
export function importFromExcel(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject(new Error('未选择文件'));
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                
                // 解析数据
                if (jsonData.length < 2) {
                    reject(new Error('Excel文件格式不正确，没有数据'));
                    return;
                }
                
                const importedContacts = [];
                
                for (let i = 1; i < jsonData.length; i++) {
                    const row = jsonData[i];
                    if (!row[0]) continue; // 跳过空行
                    
                    const methods = [];
                    if (row[1]) methods.push({ type: 'phone', value: row[1] });
                    if (row[2]) methods.push({ type: 'email', value: row[2] });
                    if (row[3]) methods.push({ type: 'wechat', value: row[3] });
                    if (row[4]) methods.push({ type: 'address', value: row[4] });
                    
                    if (methods.length === 0) continue;
                    
                    const contact = new Contact(
                        Date.now().toString() + i, // 生成唯一ID
                        row[0],
                        methods,
                        row[5] || '',
                        row[6] === '是'
                    );
                    
                    importedContacts.push(contact);
                }
                
                resolve(importedContacts);
            } catch (error) {
                reject(new Error('导入失败: ' + error.message));
            }
        };
        
        reader.onerror = function(e) {
            reject(new Error('文件读取失败'));
        };
        
        reader.readAsArrayBuffer(file);
    });
}

/**
 * 获取联系方式的中文标签
 * @param {string} type - 联系方式类型
 * @returns {string} 中文标签
 */
export function getMethodLabel(type) {
    const labels = {
        phone: '电话',
        email: '邮箱',
        wechat: '微信',
        address: '地址'
    };
    return labels[type] || type;
}