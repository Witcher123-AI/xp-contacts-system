/**
 * 联系人服务 - 处理联系人数据的增删改查
 */
import { Contact } from '../models/Contact.js';
import { storageService } from './storageService.js';

// 本地存储键名
const STORAGE_KEY = 'contacts';

/**
 * 获取所有联系人
 * @returns {Array<Contact>} 联系人列表
 */
export function getAllContacts() {
    const contacts = storageService.get(STORAGE_KEY) || [];
    return contacts.map(contact => new Contact(
        contact.id,
        contact.name,
        contact.methods,
        contact.note,
        contact.isFavorite
    ));
}

/**
 * 保存联系人列表到本地存储
 * @param {Array<Contact>} contacts - 联系人列表
 */
export function saveContacts(contacts) {
    storageService.set(STORAGE_KEY, contacts);
}

/**
 * 添加新联系人
 * @param {Contact} contact - 新联系人实例
 * @returns {Array<Contact>} 更新后的联系人列表
 */
export function addContact(contact) {
    const contacts = getAllContacts();
    contacts.push(contact);
    saveContacts(contacts);
    return contacts;
}

/**
 * 更新联系人
 * @param {Contact} updatedContact - 更新后的联系人实例
 * @returns {Array<Contact>} 更新后的联系人列表
 */
export function updateContact(updatedContact) {
    const contacts = getAllContacts();
    const index = contacts.findIndex(contact => contact.id === updatedContact.id);
    if (index !== -1) {
        contacts[index] = updatedContact;
        saveContacts(contacts);
    }
    return contacts;
}

/**
 * 删除联系人
 * @param {string} id - 要删除的联系人ID
 * @returns {Array<Contact>} 更新后的联系人列表
 */
export function deleteContact(id) {
    const contacts = getAllContacts().filter(contact => contact.id !== id);
    saveContacts(contacts);
    return contacts;
}

/**
 * 根据ID查找联系人
 * @param {string} id - 联系人ID
 * @returns {Contact|null} 找到的联系人或null
 */
export function findContactById(id) {
    const contacts = getAllContacts();
    const contact = contacts.find(contact => contact.id === id);
    return contact ? new Contact(
        contact.id,
        contact.name,
        contact.methods,
        contact.note,
        contact.isFavorite
    ) : null;
}

/**
 * 切换联系人收藏状态
 * @param {string} id - 联系人ID
 * @returns {Contact|null} 更新后的联系人或null
 */
export function toggleFavorite(id) {
    const contacts = getAllContacts();
    const contact = contacts.find(contact => contact.id === id);
    if (contact) {
        contact.isFavorite = !contact.isFavorite;
        saveContacts(contacts);
        return new Contact(
            contact.id,
            contact.name,
            contact.methods,
            contact.note,
            contact.isFavorite
        );
    }
    return null;
}

/**
 * 筛选联系人
 * @param {string} filter - 筛选条件 (all, favorites)
 * @param {string} searchTerm - 搜索关键词
 * @returns {Array<Contact>} 筛选后的联系人列表
 */
export function filterContacts(filter = 'all', searchTerm = '') {
    let contacts = getAllContacts();
    
    // 应用筛选条件
    if (filter === 'favorites') {
        contacts = contacts.filter(contact => contact.isFavorite);
    }
    
    // 应用搜索条件
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        contacts = contacts.filter(contact => {
            return (
                contact.name.toLowerCase().includes(term) ||
                contact.methods.some(method => 
                    method.value.toLowerCase().includes(term)
                )
            );
        });
    }
    
    return contacts;
}