// 联系人数据结构
class Contact {
    constructor(id, name, methods = [], note = '', isFavorite = false) {
        this.id = id;
        this.name = name;
        this.methods = methods;
        this.note = note;
        this.isFavorite = isFavorite;
    }
}

// 全局变量
let contacts = [];
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

// 初始化应用
function initApp() {
    // 从localStorage加载联系人数据
    loadContacts();
    
    // 绑定事件监听器
    bindEvents();
    
    // 渲染联系人列表
    renderContactList();
}

// 从localStorage加载联系人
function loadContacts() {
    const storedContacts = localStorage.getItem('contacts');
    if (storedContacts) {
        contacts = JSON.parse(storedContacts).map(contact => new Contact(
            contact.id,
            contact.name,
            contact.methods,
            contact.note,
            contact.isFavorite
        ));
    }
}

// 保存联系人到localStorage
function saveContacts() {
    localStorage.setItem('contacts', JSON.stringify(contacts));
}

// 绑定事件监听器
function bindEvents() {
    addContactBtn.addEventListener('click', () => openModal());
    exportBtn.addEventListener('click', exportToExcel);
    importBtn.addEventListener('click', () => importInput.click());
    importInput.addEventListener('change', importFromExcel);
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

// 渲染联系人列表
function renderContactList() {
    const filteredContacts = contacts.filter(contact => {
        const matchesFilter = currentFilter === 'all' || contact.isFavorite;
        const matchesSearch = !searchTerm || 
            contact.name.toLowerCase().includes(searchTerm) ||
            contact.methods.some(method => 
                method.value.toLowerCase().includes(searchTerm)
            );
        return matchesFilter && matchesSearch;
    });
    
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

// 显示联系人详情
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
                <button class="btn btn-primary btn-sm" onclick="editContact(${contact.id})">编辑</button>
                <button class="btn btn-secondary btn-sm" onclick="toggleFavorite(${contact.id})">
                    ${contact.isFavorite ? '取消收藏' : '收藏'}
                </button>
                <button class="btn btn-secondary btn-sm" onclick="deleteContact(${contact.id})">删除</button>
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

// 获取联系方式标签
function getMethodLabel(type) {
    const labels = {
        phone: '电话',
        email: '邮箱',
        wechat: '微信',
        address: '地址'
    };
    return labels[type] || type;
}

// 打开添加/编辑模态框
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

// 关闭模态框
function closeModalHandler() {
    contactModal.classList.remove('show');
    contactForm.reset();
    contactMethods.innerHTML = '';
}

// 添加联系方式字段
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

// 删除联系方式字段
function removeMethodField(btn) {
    const methodDiv = btn.closest('.contact-method');
    if (contactMethods.children.length > 1) {
        methodDiv.remove();
    }
}

// 处理表单提交
function handleFormSubmit(e) {
    e.preventDefault();
    
    const id = contactId.value || Date.now().toString();
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
    
    // 创建或更新联系人
    const contact = new Contact(id, name, methods, note, favorite);
    
    if (contactId.value) {
        // 更新现有联系人
        const index = contacts.findIndex(c => c.id === id);
        contacts[index] = contact;
    } else {
        // 添加新联系人
        contacts.push(contact);
    }
    
    // 保存并刷新界面
    saveContacts();
    renderContactList();
    showContactDetail(contact);
    closeModalHandler();
}

// 编辑联系人
function editContact(id) {
    const contact = contacts.find(c => c.id === id.toString());
    if (contact) {
        openModal(contact);
    }
}

// 切换收藏状态
function toggleFavorite(id) {
    const contact = contacts.find(c => c.id === id.toString());
    if (contact) {
        contact.isFavorite = !contact.isFavorite;
        saveContacts();
        renderContactList();
        showContactDetail(contact);
    }
}

// 删除联系人
function deleteContact(id) {
    if (confirm('确定要删除这个联系人吗？')) {
        contacts = contacts.filter(c => c.id !== id.toString());
        saveContacts();
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

// 导出到Excel
function exportToExcel() {
    if (contacts.length === 0) {
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

// 导入Excel
function importFromExcel(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // 解析数据
        if (jsonData.length < 2) {
            alert('Excel文件格式不正确，没有数据');
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
        
        if (importedContacts.length === 0) {
            alert('没有导入任何联系人');
            return;
        }
        
        // 合并联系人
        contacts = [...contacts, ...importedContacts];
        saveContacts();
        renderContactList();
        
        alert(`成功导入 ${importedContacts.length} 个联系人`);
        importInput.value = ''; // 重置文件输入
    };
    
    reader.readAsArrayBuffer(file);
}

// 初始化应用
document.addEventListener('DOMContentLoaded', initApp);

// 将函数暴露给全局作用域，以便在HTML中调用
window.editContact = editContact;
window.toggleFavorite = toggleFavorite;
window.deleteContact = deleteContact;
window.addMethodField = addMethodField;
window.removeMethodField = removeMethodField;
window.closeModalHandler = closeModalHandler;