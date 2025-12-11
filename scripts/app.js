/**
 * 通讯录管理系统 - 主应用入口
 */
import { Contact, createContact } from '../models/Contact.js';
import { 
    getAllContacts, 
    saveContacts, 
    addContact, 
    updateContact, 
    deleteContact, 
    findContactById,
    toggleFavorite,
    filterContacts
} from '../services/contactService.js';
import { 
    exportToExcel, 
    importFromExcel,
    getMethodLabel
} from '../services/importExportService.js';

// 全局变量
let currentContact = null;
let currentFilter = 'all';
let searchTerm = '';

// DOM元素
const contactList = document.getElementById('contactList');
const contactDetail = document.getElementById('contactDetail');
const addContactBtn = document.getElementById('addContactBtn');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importInput = document.getElementById('importInput');
const searchInput = document.getElementById('searchInput');
const filterTabs = document.querySelectorAll('.tab-btn');
const contactModal = document.getElementById('contactModal');
const contactForm = document.getElementById('contactForm');
const modalTitle = document.getElementById('modalTitle');
const contactId = document.getElementById('contactId');
const contactName = document.getElementById('contactName');
const contactMethods = document.getElementById('contactMethods');
const addMethodBtn = document.getElementById('addMethodBtn');
const contactNote = document.getElementById('contactNote');
const isFavorite = document.getElementById('isFavorite');
const closeModal = document.querySelector('.close');
const cancelBtn = document.getElementById('cancelBtn');

/**
 * 初始化应用
 */
function initApp() {
    // 绑定事件监听器
    bindEvents();
    
    // 渲染联系人列表
    renderContactList();
}

/**
 * 绑定事件监听器
 */
function bindEvents() {
    addContactBtn.addEventListener('click', () => openModal());
    exportBtn.addEventListener('click', handleExport);
    importBtn.addEventListener('click', () => importInput.click());
    importInput.addEventListener('change', handleImport);
    searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value.toLowerCase();
        renderContactList();
    });
    
    // 筛选标签
    filterTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            filterTabs.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            renderContactList();
        });
    });
    
    // 模态框事件
    closeModal.addEventListener('click', closeModalHandler);
    cancelBtn.addEventListener('click', closeModalHandler);
    window.addEventListener('click', (e) => {
        if (e.target === contactModal) {
            closeModalHandler();
        }
    });
    
    contactForm.addEventListener('submit', handleFormSubmit);
    addMethodBtn.addEventListener('click', addMethodField);
}

/**
 * 渲染联系人列表
 */
function renderContactList() {
    const filteredContacts = filterContacts(currentFilter, searchTerm);
    
    contactList.innerHTML = '';
    
    if (filteredContacts.length === 0) {
        contactList.innerHTML = '<p style="text-align: center; padding: 20px; color: #7f8c8d;">暂无联系人</p>';
        return;
    }
    
    filteredContacts.forEach(contact => {
        const contactItem = document.createElement('div');
        contactItem.className = `contact-item ${currentContact?.id === contact.id ? 'selected' : ''}`;
        contactItem.dataset.id = contact.id;
        
        // 获取主要联系方式预览
        const mainMethod = contact.methods[0];
        const methodPreview = mainMethod ? `${getMethodLabel(mainMethod.type)}: ${mainMethod.value}` : '无联系方式';
        
        contactItem.innerHTML = `
            <div class="contact-info">
                <div class="contact-name">${contact.name} ${contact.isFavorite ? '<span class="favorite-icon">★</span>' : ''}</div>
                <div class="contact-preview">${methodPreview}</div>
            </div>
        `;
        
        contactItem.addEventListener('click', () => showContactDetail(contact));
        contactList.appendChild(contactItem);
    });
}

/**
 * 显示联系人详情
 * @param {Contact} contact - 要显示的联系人
 */
function showContactDetail(contact) {
    currentContact = contact;
    
    // 更新列表选中状态
    document.querySelectorAll('.contact-item').forEach(item => {
        item.classList.remove('selected');
    });
    document.querySelector(`[data-id="${contact.id}"]`).classList.add('selected');
    
    // 渲染详情
    const methodsHtml = contact.methods.map(method => `
        <div class="contact-method-item">
            <span class="method-label">${getMethodLabel(method.type)}</span>
            <span class="method-value">${method.value}</span>
        </div>
    `).join('');
    
    contactDetail.innerHTML = `
        <div class="detail-header">
            <div>
                <h2 class="detail-name">${contact.name} ${contact.isFavorite ? '<span class="favorite-icon">★</span>' : ''}</h2>
            </div>
            <div class="detail-actions">
                <button class="btn btn-primary btn-sm" onclick="editContact('${contact.id}')">编辑</button>
                <button class="btn btn-secondary btn-sm" onclick="handleToggleFavorite('${contact.id}')">
                    ${contact.isFavorite ? '取消收藏' : '收藏'}
                </button>
                <button class="btn btn-secondary btn-sm" onclick="handleDeleteContact('${contact.id}')">删除</button>
            </div>
        </div>
        <div class="detail-section">
            <h3>联系方式</h3>
            ${methodsHtml || '<p style="color: #7f8c8d;">无联系方式</p>'}
        </div>
        ${contact.note ? `
            <div class="detail-section">
                <h3>备注</h3>
                <div class="detail-note">${contact.note}</div>
            </div>
        ` : ''}
    `;
}

/**
 * 打开添加/编辑模态框
 * @param {Contact|null} contact - 要编辑的联系人，null表示添加新联系人
 */
function openModal(contact = null) {
    contactModal.classList.add('show');
    
    if (contact) {
        modalTitle.textContent = '编辑联系人';
        contactId.value = contact.id;
        contactName.value = contact.name;
        contactNote.value = contact.note;
        isFavorite.checked = contact.isFavorite;
        
        // 填充联系方式
        contactMethods.innerHTML = '';
        contact.methods.forEach(method => {
            addMethodField(method.type, method.value);
        });
    } else {
        modalTitle.textContent = '添加联系人';
        contactForm.reset();
        contactMethods.innerHTML = '';
        addMethodField();
    }
}

/**
 * 关闭模态框
 */
function closeModalHandler() {
    contactModal.classList.remove('show');
    contactForm.reset();
    contactMethods.innerHTML = '';
}

/**
 * 添加联系方式字段
 * @param {string} type - 联系方式类型
 * @param {string} value - 联系方式值
 */
function addMethodField(type = 'phone', value = '') {
    const methodDiv = document.createElement('div');
    methodDiv.className = 'contact-method';
    methodDiv.innerHTML = `
        <select class="method-type">
            <option value="phone" ${type === 'phone' ? 'selected' : ''}>电话</option>
            <option value="email" ${type === 'email' ? 'selected' : ''}>邮箱</option>
            <option value="wechat" ${type === 'wechat' ? 'selected' : ''}>微信</option>
            <option value="address" ${type === 'address' ? 'selected' : ''}>地址</option>
        </select>
        <input type="text" class="method-value" value="${value}" placeholder="请输入联系方式">
        <button type="button" class="remove-method" onclick="removeMethodField(this)">删除</button>
    `;
    contactMethods.appendChild(methodDiv);
}

/**
 * 删除联系方式字段
 * @param {HTMLElement} btn - 删除按钮元素
 */
function removeMethodField(btn) {
    const methodDiv = btn.closest('.contact-method');
    if (contactMethods.children.length > 1) {
        methodDiv.remove();
    }
}

/**
 * 处理表单提交
 * @param {Event} e - 表单提交事件
 */
function handleFormSubmit(e) {
    e.preventDefault();
    
    const id = contactId.value;
    const name = contactName.value.trim();
    const note = contactNote.value.trim();
    const favorite = isFavorite.checked;
    
    // 收集联系方式
    const methods = [];
    document.querySelectorAll('.contact-method').forEach(methodDiv => {
        const type = methodDiv.querySelector('.method-type').value;
        const value = methodDiv.querySelector('.method-value').value.trim();
        if (value) {
            methods.push({ type, value });
        }
    });
    
    // 验证
    if (!name) {
        alert('请输入联系人姓名');
        return;
    }
    
    if (methods.length === 0) {
        alert('请至少添加一种联系方式');
        return;
    }
    
    let updatedContacts;
    
    if (id) {
        // 更新现有联系人
        const contact = new Contact(id, name, methods, note, favorite);
        updatedContacts = updateContact(contact);
    } else {
        // 添加新联系人
        const contact = createContact(name, methods, note, favorite);
        updatedContacts = addContact(contact);
    }
    
    // 刷新界面
    renderContactList();
    const newContact = findContactById(id || updatedContacts[updatedContacts.length - 1].id);
    showContactDetail(newContact);
    closeModalHandler();
}

/**
 * 处理导出功能
 */
function handleExport() {
    const contacts = getAllContacts();
    exportToExcel(contacts);
}

/**
 * 处理导入功能
 * @param {Event} e - 文件选择事件
 */
function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    importFromExcel(file)
        .then(importedContacts => {
            if (importedContacts.length === 0) {
                alert('没有导入任何联系人');
                return;
            }
            
            // 合并联系人
            const existingContacts = getAllContacts();
            const allContacts = [...existingContacts, ...importedContacts];
            saveContacts(allContacts);
            renderContactList();
            
            alert(`成功导入 ${importedContacts.length} 个联系人`);
            importInput.value = ''; // 重置文件输入
        })
        .catch(error => {
            alert('导入失败: ' + error.message);
            importInput.value = '';
        });
}

/**
 * 编辑联系人
 * @param {string} id - 联系人ID
 */
function editContact(id) {
    const contact = findContactById(id);
    if (contact) {
        openModal(contact);
    }
}

/**
 * 切换联系人收藏状态
 * @param {string} id - 联系人ID
 */
function handleToggleFavorite(id) {
    const updatedContact = toggleFavorite(id);
    if (updatedContact) {
        renderContactList();
        if (currentContact && currentContact.id === id) {
            showContactDetail(updatedContact);
        }
    }
}

/**
 * 删除联系人
 * @param {string} id - 联系人ID
 */
function handleDeleteContact(id) {
    if (confirm('确定要删除这个联系人吗？')) {
        const updatedContacts = deleteContact(id);
        renderContactList();
        
        // 清除详情
        contactDetail.innerHTML = `
            <div class="empty-state">
                <h3>请选择一个联系人查看详情</h3>
                <p>或点击上方"添加联系人"按钮创建新联系人</p>
            </div>
        `;
        currentContact = null;
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', initApp);

// 将函数暴露给全局作用域，以便在HTML中调用
window.editContact = editContact;
window.handleToggleFavorite = handleToggleFavorite;
window.handleDeleteContact = handleDeleteContact;
window.addMethodField = addMethodField;
window.removeMethodField = removeMethodField;
window.closeModalHandler = closeModalHandler;