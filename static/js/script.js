document.addEventListener('DOMContentLoaded', function() {
    // 处理类别卡片的点击
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // 如果点击的是子类别卡片或其内容，不要触发父类别的展开/收起
            if (e.target.closest('.subcategory-card')) {
                e.stopPropagation();
                return;
            }
            
            // 切换当前卡片的展开状态
            const subcategoryGrid = this.querySelector('.subcategory-grid');
            subcategoryGrid.classList.toggle('hidden');
            this.classList.toggle('expanded');
        });
    });

    // 处理子类别卡片的点击
    const subcategoryCards = document.querySelectorAll('.subcategory-card');
    subcategoryCards.forEach(card => {
        card.addEventListener('click', function(e) {
            e.stopPropagation();
            const categoryId = this.closest('.category-card').dataset.categoryId;
            const subcategoryId = this.dataset.subcategoryId;
            window.location.href = `/subcategory/${categoryId}/${subcategoryId}`;
        });
    });
});
