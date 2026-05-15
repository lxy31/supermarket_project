import { useMemo, useState } from 'react'
import { ArrowUpDown, BadgePercent, ChevronDown, Flame, ListFilter, PackageOpen, ShoppingBag, TriangleAlert, X } from 'lucide-react'

type Product = {
  id: string
  name: string
  categoryId: string
  subCategoryId: string
  image: string
  spec: string
  price: number
  originalPrice?: number
  stock: number
  unit: string
  tags?: string[]
  origin: string
  variety: string
  description: string
  knowledge: {
    title: string
    body: string
  }[]
}

type CartItem = {
  productId: string
  quantity: number
}

type Category = {
  id: string
  name: string
  icon?: string
}

type SubCategory = {
  id: string
  categoryId: string
  name: string
}

type SortBy = 'default' | 'priceAsc' | 'priceDesc' | 'stockAsc'
type QuickFilter = 'all' | 'hot' | 'lowStock' | 'promo'

const categories: Category[] = [
  { id: 'fresh', name: '生鲜果蔬', icon: 'F' },
  { id: 'meat', name: '肉禽蛋奶', icon: 'M' },
  { id: 'snack', name: '休闲零食', icon: 'S' },
  { id: 'drink', name: '酒水饮料', icon: 'D' },
  { id: 'daily', name: '日用百货', icon: 'H' },
]

const subCategories: SubCategory[] = [
  { id: 'tomato', categoryId: 'fresh', name: '茄果类' },
  { id: 'fruit', categoryId: 'fresh', name: '水果' },
  { id: 'leafy', categoryId: 'fresh', name: '叶菜' },
  { id: 'poultry', categoryId: 'meat', name: '肉禽' },
  { id: 'egg-milk', categoryId: 'meat', name: '蛋奶' },
  { id: 'puffed', categoryId: 'snack', name: '膨化' },
  { id: 'cookie', categoryId: 'snack', name: '饼干' },
  { id: 'sparkling', categoryId: 'drink', name: '气泡饮' },
  { id: 'water', categoryId: 'drink', name: '饮用水' },
  { id: 'paper', categoryId: 'daily', name: '纸品' },
  { id: 'laundry', categoryId: 'daily', name: '清洁洗护' },
]

const products: Product[] = [
  {
    id: 'p-001',
    name: '本地小番茄',
    categoryId: 'fresh',
    subCategoryId: 'tomato',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=640&q=80',
    spec: '500g/盒',
    price: 8.9,
    originalPrice: 11.9,
    stock: 32,
    unit: '盒',
    tags: ['促销', '今日热销'],
    origin: '山东寿光',
    variety: '樱桃番茄',
    description: '果皮薄、汁水足，适合凉拌、便当配菜和儿童零食。',
    knowledge: [
      { title: '种类特点', body: '樱桃番茄个头小、糖酸平衡，皮薄多汁，比普通番茄更适合直接食用。' },
      { title: '挑选方法', body: '优先选择色泽均匀、果蒂新鲜、表皮紧实无裂口的果实。' },
      { title: '保存建议', body: '未完全成熟可常温放置，成熟后冷藏并尽量在 2-3 天内食用。' },
    ],
  },
  {
    id: 'p-002',
    name: '精选香蕉',
    categoryId: 'fresh',
    subCategoryId: 'fruit',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=640&q=80',
    spec: '约1kg',
    price: 6.8,
    stock: 48,
    unit: '份',
    tags: ['今日热销'],
    origin: '云南西双版纳',
    variety: '香芽蕉',
    description: '成熟度稳定，口感软糯香甜，适合早餐、烘焙和日常补货。',
    knowledge: [
      { title: '种类特点', body: '香芽蕉香气明显，熟后果肉细腻，适合老人和儿童日常食用。' },
      { title: '成熟判断', body: '表皮出现少量芝麻点时甜度较好，整串过青可常温催熟。' },
      { title: '保存建议', body: '避免冷藏低温伤害，可悬挂或分开放置减少挤压。' },
    ],
  },
  {
    id: 'p-003',
    name: '精品青菜',
    categoryId: 'fresh',
    subCategoryId: 'leafy',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=640&q=80',
    spec: '400g/把',
    price: 4.6,
    stock: 7,
    unit: '把',
    tags: ['库存不足'],
    origin: '本地合作菜园',
    variety: '绿叶青菜',
    description: '清晨采收，叶片饱满，适合清炒、煮面和家庭小份购买。',
    knowledge: [
      { title: '营养特点', body: '绿叶菜富含膳食纤维和叶绿素，适合搭配主食和肉类平衡餐盘。' },
      { title: '挑选方法', body: '叶片挺立、颜色自然、根部不发黑的青菜更新鲜。' },
      { title: '保存建议', body: '用厨房纸包裹后冷藏，烹饪前再清洗可减少水分流失。' },
    ],
  },
  {
    id: 'p-004',
    name: '冷鲜鸡胸肉',
    categoryId: 'meat',
    subCategoryId: 'poultry',
    image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=640&q=80',
    spec: '500g/袋',
    price: 18.8,
    originalPrice: 22.9,
    stock: 18,
    unit: '袋',
    tags: ['促销'],
    origin: '山东临沂',
    variety: '冷鲜分割禽肉',
    description: '低脂高蛋白，适合煎烤、沙拉和健身餐备货。',
    knowledge: [
      { title: '食材特点', body: '鸡胸肉脂肪含量低，蛋白质充足，适合轻食和健身餐。' },
      { title: '处理建议', body: '烹饪前可用少量盐和淀粉腌制，口感更嫩。' },
      { title: '保存建议', body: '冷鲜肉建议当天食用，短期保存需密封冷藏。' },
    ],
  },
  {
    id: 'p-005',
    name: '鲜鸡蛋',
    categoryId: 'meat',
    subCategoryId: 'egg-milk',
    image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=640&q=80',
    spec: '15枚/盒',
    price: 13.5,
    stock: 0,
    unit: '盒',
    tags: ['缺货'],
    origin: '湖北黄冈',
    variety: '谷物喂养鲜鸡蛋',
    description: '蛋壳洁净，适合早餐、烘焙和家庭日常采购。',
    knowledge: [
      { title: '营养特点', body: '鸡蛋含优质蛋白和卵磷脂，是家庭早餐和烘焙的基础食材。' },
      { title: '挑选方法', body: '蛋壳完整、无异味、摇晃无明显晃动感通常更新鲜。' },
      { title: '保存建议', body: '尖端朝下冷藏存放，避免和气味重的食材混放。' },
    ],
  },
  {
    id: 'p-006',
    name: '纯牛奶',
    categoryId: 'meat',
    subCategoryId: 'egg-milk',
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=640&q=80',
    spec: '250ml*12盒',
    price: 39.9,
    originalPrice: 46.9,
    stock: 16,
    unit: '箱',
    tags: ['促销', '今日热销'],
    origin: '黑龙江齐齐哈尔',
    variety: '全脂纯牛奶',
    description: '奶香浓郁，常温保存，适合家庭、办公室和早餐搭配。',
    knowledge: [
      { title: '品类特点', body: '全脂牛奶保留乳脂风味，适合直接饮用、冲麦片或做奶咖。' },
      { title: '饮用建议', body: '早餐搭配谷物、鸡蛋或面包，可以提升饱腹感。' },
      { title: '保存建议', body: '未开封常温避光，开封后冷藏并尽快饮用。' },
    ],
  },
  {
    id: 'p-007',
    name: '原味薯片',
    categoryId: 'snack',
    subCategoryId: 'puffed',
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=640&q=80',
    spec: '135g/袋',
    price: 7.9,
    stock: 41,
    unit: '袋',
    tags: ['今日热销'],
    origin: '上海松江',
    variety: '马铃薯膨化食品',
    description: '原味咸香，适合休闲零食区陈列和高频即时购买。',
    knowledge: [
      { title: '品类特点', body: '膨化零食口感酥脆，适合作为休闲场景下的即时消费品。' },
      { title: '陈列建议', body: '可与饮料、坚果和家庭装零食组合陈列，提升连带购买。' },
      { title: '保存建议', body: '开封后注意密封，避免受潮影响口感。' },
    ],
  },
  {
    id: 'p-008',
    name: '夹心饼干',
    categoryId: 'snack',
    subCategoryId: 'cookie',
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=640&q=80',
    spec: '308g/包',
    price: 12.9,
    stock: 22,
    unit: '包',
    origin: '广东佛山',
    variety: '奶油夹心饼干',
    description: '独立包装，适合儿童零食、办公室茶点和促销组合。',
    knowledge: [
      { title: '品类特点', body: '夹心饼干甜度稳定，独立包装方便分享和外出携带。' },
      { title: '搭配建议', body: '适合与牛奶、咖啡、茶饮搭配，提升早餐和下午茶场景感。' },
      { title: '保存建议', body: '放在阴凉干燥处，开封后密封保存避免回潮。' },
    ],
  },
  {
    id: 'p-009',
    name: '苏打气泡水',
    categoryId: 'drink',
    subCategoryId: 'sparkling',
    image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=640&q=80',
    spec: '330ml*6罐',
    price: 19.9,
    originalPrice: 24.9,
    stock: 25,
    unit: '组',
    tags: ['促销'],
    origin: '浙江杭州',
    variety: '无糖苏打气泡水',
    description: '气泡充足，清爽解腻，适合饮料区和轻食搭配。',
    knowledge: [
      { title: '品类特点', body: '无糖气泡水口感清爽，适合替代高糖饮料。' },
      { title: '饮用建议', body: '冰镇后气泡感更明显，可搭配柠檬片或水果。' },
      { title: '陈列建议', body: '适合放在冷柜、轻食区或烧烤食材附近。' },
    ],
  },
  {
    id: 'p-010',
    name: '瓶装矿泉水',
    categoryId: 'drink',
    subCategoryId: 'water',
    image: 'https://images.unsplash.com/photo-1559839914-17aae19cec71?auto=format&fit=crop&w=640&q=80',
    spec: '550ml*24瓶',
    price: 28.8,
    stock: 5,
    unit: '箱',
    tags: ['库存不足'],
    origin: '吉林长白山',
    variety: '天然矿泉水',
    description: '家庭整箱装，高周转商品，适合门店常规补货。',
    knowledge: [
      { title: '品类特点', body: '整箱水是高频基础品，适合家庭囤货和办公室采购。' },
      { title: '消费场景', body: '适合运动、出行、会议和日常家庭饮用。' },
      { title: '保存建议', body: '避免阳光直晒和高温环境，开瓶后尽快饮用。' },
    ],
  },
  {
    id: 'p-011',
    name: '抽取式纸巾',
    categoryId: 'daily',
    subCategoryId: 'paper',
    image: 'https://images.unsplash.com/photo-1584556812952-905ffd0c611a?auto=format&fit=crop&w=640&q=80',
    spec: '3层*120抽*6包',
    price: 21.9,
    originalPrice: 26.9,
    stock: 36,
    unit: '提',
    tags: ['促销'],
    origin: '福建泉州',
    variety: '三层抽取式纸巾',
    description: '柔韧亲肤，适合家庭日用、收银台关联陈列和会员促销。',
    knowledge: [
      { title: '品类特点', body: '三层纸巾兼顾柔软度和韧性，是家庭复购率较高的日用品。' },
      { title: '选购建议', body: '关注层数、抽数、纸张尺寸和是否易掉屑。' },
      { title: '陈列建议', body: '可与清洁用品、厨房纸、湿巾形成家庭日用组合。' },
    ],
  },
  {
    id: 'p-012',
    name: '洗衣凝珠',
    categoryId: 'daily',
    subCategoryId: 'laundry',
    image: 'https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?auto=format&fit=crop&w=640&q=80',
    spec: '36颗/盒',
    price: 49.9,
    stock: 12,
    unit: '盒',
    origin: '江苏苏州',
    variety: '浓缩洗衣凝珠',
    description: '一颗一洗，适合家庭洗护区陈列，客单价贡献较高。',
    knowledge: [
      { title: '品类特点', body: '洗衣凝珠预先定量，使用方便，适合机洗场景。' },
      { title: '使用建议', body: '先放凝珠再放衣物，避免直接剪开或接触儿童。' },
      { title: '保存建议', body: '密封防潮，放在阴凉处并远离儿童可触及位置。' },
    ],
  },
]

const formatCurrency = (value: number) => `¥${value.toFixed(2)}`

const sortOptions: Array<{ value: SortBy; label: string }> = [
  { value: 'default', label: '默认排序' },
  { value: 'priceAsc', label: '价格低到高' },
  { value: 'priceDesc', label: '价格高到低' },
  { value: 'stockAsc', label: '库存优先' },
]

function App() {
  const [selectedCategoryId, setSelectedCategoryId] = useState('all')
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState('all')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('default')
  const [activeQuickFilter, setActiveQuickFilter] = useState<QuickFilter>('all')
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCategoryNavOpen, setIsCategoryNavOpen] = useState(true)
  const [activeProduct, setActiveProduct] = useState<Product | null>(null)
  const [isSortOpen, setIsSortOpen] = useState(false)

  const cartMap = useMemo(() => new Map(cartItems.map((item) => [item.productId, item.quantity])), [cartItems])

  const visibleProducts = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase()

    const filtered = products.filter((product) => {
      const matchesCategory = selectedCategoryId === 'all' || product.categoryId === selectedCategoryId
      const matchesSubCategory = selectedSubCategoryId === 'all' || product.subCategoryId === selectedSubCategoryId
      const matchesSearch =
        !keyword ||
        product.name.toLowerCase().includes(keyword) ||
        product.spec.toLowerCase().includes(keyword) ||
        product.tags?.some((tag) => tag.toLowerCase().includes(keyword))
      const matchesQuickFilter =
        activeQuickFilter === 'all' ||
        (activeQuickFilter === 'hot' && product.tags?.includes('今日热销')) ||
        (activeQuickFilter === 'lowStock' && product.stock > 0 && product.stock <= 8) ||
        (activeQuickFilter === 'promo' && Boolean(product.originalPrice))

      return matchesCategory && matchesSubCategory && matchesSearch && matchesQuickFilter
    })

    return [...filtered].sort((first, second) => {
      if (sortBy === 'priceAsc') return first.price - second.price
      if (sortBy === 'priceDesc') return second.price - first.price
      if (sortBy === 'stockAsc') return first.stock - second.stock
      return 0
    })
  }, [activeQuickFilter, searchKeyword, selectedCategoryId, selectedSubCategoryId, sortBy])

  const cartDetails = useMemo(
    () =>
      cartItems
        .map((item) => {
          const product = products.find((candidate) => candidate.id === item.productId)
          if (!product) return null
          return {
            ...item,
            product,
            lineTotal: product.price * item.quantity,
            lineSavings: ((product.originalPrice ?? product.price) - product.price) * item.quantity,
          }
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [cartItems],
  )

  const subtotal = cartDetails.reduce((sum, item) => sum + item.lineTotal, 0)
  const savings = cartDetails.reduce((sum, item) => sum + item.lineSavings, 0)
  const cartCount = cartDetails.reduce((sum, item) => sum + item.quantity, 0)

  const setProductQuantity = (productId: string, nextQuantity: number) => {
    const product = products.find((candidate) => candidate.id === productId)
    if (!product || product.stock === 0) return

    const safeQuantity = Math.max(0, Math.min(nextQuantity, product.stock))
    setCartItems((current) => {
      if (safeQuantity === 0) {
        return current.filter((item) => item.productId !== productId)
      }

      const exists = current.some((item) => item.productId === productId)
      if (!exists) {
        return [...current, { productId, quantity: safeQuantity }]
      }

      return current.map((item) => (item.productId === productId ? { ...item, quantity: safeQuantity } : item))
    })
  }

  const selectCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId)
    setSelectedSubCategoryId('all')
    setIsCategoryNavOpen(true)
  }

  const resetProductView = () => {
    setSelectedCategoryId('all')
    setSelectedSubCategoryId('all')
    setIsCategoryNavOpen((current) => !current)
  }

  const quickFilters = [
    { value: 'all', label: '全部', icon: ListFilter },
    { value: 'hot', label: '今日热销', icon: Flame },
    { value: 'lowStock', label: '库存不足', icon: TriangleAlert },
    { value: 'promo', label: '促销商品', icon: BadgePercent },
  ] as const
  const activeSortLabel = sortOptions.find((option) => option.value === sortBy)?.label ?? '排序'

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="系统导航">
        <div className="brand">
          <div className="brand-mark">SM</div>
          <div>
            <strong>邻里优选</strong>
            <span>Supermarket Manager</span>
          </div>
        </div>

        <nav className="nav-list" aria-label="系统菜单">
          <div className={`nav-group ${isCategoryNavOpen ? 'active open' : 'active'}`}>
            <button
              aria-expanded={isCategoryNavOpen}
              className="nav-primary"
              onClick={resetProductView}
              type="button"
            >
              商品购买
              <ChevronDown aria-hidden="true" size={16} />
            </button>
            <div className="sidebar-categories" aria-label="商品购买分类" hidden={!isCategoryNavOpen}>
              {categories.map((category) => {
                const count = products.filter((product) => product.categoryId === category.id).length
                const categorySubCategories = subCategories.filter((item) => item.categoryId === category.id)

                return (
                  <div className="category-branch" key={category.id}>
                    <button
                      className={selectedCategoryId === category.id ? 'active' : ''}
                      onClick={() => selectCategory(category.id)}
                      type="button"
                    >
                      <span className="category-icon">{category.icon}</span>
                      <span>{category.name}</span>
                      <strong>{count}</strong>
                    </button>

                    {selectedCategoryId === category.id ? (
                      <div className="sub-category-list" aria-label={`${category.name}三级分类`}>
                        {categorySubCategories.map((subCategory) => {
                          const subCount = products.filter((product) => product.subCategoryId === subCategory.id).length

                          return (
                            <button
                              className={selectedSubCategoryId === subCategory.id ? 'active' : ''}
                              key={subCategory.id}
                              onClick={() => setSelectedSubCategoryId(subCategory.id)}
                              type="button"
                            >
                              <span>{subCategory.name}</span>
                              <strong>{subCount}</strong>
                            </button>
                          )
                        })}
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>
          <a href="#stock">库存管理</a>
          <a href="#orders">订单记录</a>
          <a href="#members">会员中心</a>
          <a href="#reports">经营报表</a>
        </nav>
      </aside>

      <main className="workspace" id="purchase">
        <header className="topbar">
          <div>
            <p className="eyebrow">门店工作台</p>
            <h1>商品购买</h1>
            <div className="store-context" aria-label="门店信息">
              <span>人民路店</span>
              <span>收银员：李敏</span>
            </div>
          </div>

          <div className="store-meta">
            <span className="status-dot" aria-hidden="true" />
            <strong>营业中</strong>
          </div>
        </header>

        <section className="toolbar" aria-label="商品筛选">
          <label className="search-box">
            <span>搜索</span>
            <input
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
              placeholder="输入商品名、规格或标签"
            />
          </label>

          <div className="quick-filters" aria-label="快捷筛选">
            {quickFilters.map(({ value, label, icon: Icon }) => (
              <button
                className={activeQuickFilter === value ? 'selected' : ''}
                key={value}
                onClick={() => setActiveQuickFilter(value as QuickFilter)}
                title={label}
                type="button"
                aria-label={label}
              >
                <Icon aria-hidden="true" size={20} />
                <span className="visually-hidden">{label}</span>
                <span className="filter-tooltip" role="tooltip">
                  {label}
                </span>
              </button>
            ))}
          </div>

          <div className="sort-menu">
            <button
              aria-expanded={isSortOpen}
              className="sort-trigger"
              onClick={() => setIsSortOpen((current) => !current)}
              type="button"
            >
              <ArrowUpDown aria-hidden="true" size={17} />
              <span>{activeSortLabel}</span>
              <ChevronDown aria-hidden="true" size={15} />
            </button>
            {isSortOpen ? (
              <div className="sort-options" aria-label="排序">
                {sortOptions.map((option) => (
                  <button
                    className={sortBy === option.value ? 'active' : ''}
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value)
                      setIsSortOpen(false)
                    }}
                    type="button"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        <section className="mobile-category-panel" aria-label="商品分类">
          {categories.map((category) => {
            const count = products.filter((product) => product.categoryId === category.id).length

            return (
              <button
                className={selectedCategoryId === category.id ? 'active' : ''}
                key={category.id}
                onClick={() => selectCategory(category.id)}
                type="button"
              >
                <span className="category-icon">{category.icon}</span>
                <span>{category.name}</span>
                <strong>{count}</strong>
              </button>
            )
          })}
        </section>

        <div className="content-grid">
          <section className="product-area" aria-label="商品列表">
            <div className="section-heading product-heading">
              <div>
                <h2>商品列表</h2>
                <span>已筛选 {visibleProducts.length} 件</span>
              </div>
              <span className="hint">商品卡可直接加购并修改数量</span>
            </div>

            <div className="product-grid">
              {visibleProducts.map((product) => {
                const quantity = cartMap.get(product.id) ?? 0
                const isSelected = quantity > 0
                const isOutOfStock = product.stock === 0

                return (
                  <article className={`product-card ${isSelected ? 'in-cart' : ''}`} key={product.id}>
                    <button
                      className="product-image-wrap"
                      onClick={() => setActiveProduct(product)}
                      type="button"
                      aria-label={`查看${product.name}详情`}
                    >
                      <img alt={product.name} src={product.image} />
                      {isOutOfStock ? <span className="status-badge danger">缺货</span> : null}
                      {isSelected ? <span className="status-badge success">已选 {quantity}</span> : null}
                      <span className="image-hover-card" aria-hidden="true">
                        <strong>{product.name}</strong>
                        <span>{product.variety}</span>
                        <span>
                          {categories.find((item) => item.id === product.categoryId)?.name} /{' '}
                          {subCategories.find((item) => item.id === product.subCategoryId)?.name}
                        </span>
                        <span>{product.origin}</span>
                      </span>
                    </button>

                    <div className="product-info">
                      <div>
                        <h3>{product.name}</h3>
                        <p>{product.spec}</p>
                      </div>

                      <div className="tag-row">
                        {product.tags?.slice(0, 2).map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </div>

                      <div className="price-row">
                        <strong>{formatCurrency(product.price)}</strong>
                        {product.originalPrice ? <del>{formatCurrency(product.originalPrice)}</del> : null}
                        <span>库存 {product.stock}</span>
                      </div>

                      {quantity === 0 ? (
                        <button
                          className="add-button"
                          disabled={isOutOfStock}
                          onClick={() => setProductQuantity(product.id, 1)}
                          type="button"
                        >
                          {isOutOfStock ? '暂不可售' : '加入购物车'}
                        </button>
                      ) : (
                        <div className="quantity-control" aria-label={`${product.name} 数量`}>
                          <button onClick={() => setProductQuantity(product.id, quantity - 1)} type="button">
                            -
                          </button>
                          <input
                            aria-label="购买数量"
                            max={product.stock}
                            min={0}
                            onChange={(event) => setProductQuantity(product.id, Number(event.target.value))}
                            type="number"
                            value={quantity}
                          />
                          <button onClick={() => setProductQuantity(product.id, quantity + 1)} type="button">
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          </section>

          <CartPanel
            cartCount={cartCount}
            cartDetails={cartDetails}
            onClear={() => setCartItems([])}
            onQuantityChange={setProductQuantity}
            savings={savings}
            subtotal={subtotal}
          />
        </div>
      </main>

      <button className="mobile-cart-bar" onClick={() => setIsCartOpen(true)} type="button">
        <span>{cartCount} 件商品</span>
        <strong>{formatCurrency(subtotal)}</strong>
        <em>查看购物车</em>
      </button>

      <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`} aria-hidden={!isCartOpen}>
        <button className="drawer-backdrop" onClick={() => setIsCartOpen(false)} type="button" />
        <div className="drawer-panel">
          <div className="drawer-header">
            <strong>购物车</strong>
            <button onClick={() => setIsCartOpen(false)} type="button">
              关闭
            </button>
          </div>
          <CartPanel
            cartCount={cartCount}
            cartDetails={cartDetails}
            onClear={() => setCartItems([])}
            onQuantityChange={setProductQuantity}
            savings={savings}
            subtotal={subtotal}
            variant="drawer"
          />
        </div>
      </div>

      {activeProduct ? (
        <ProductDetailDialog
          product={activeProduct}
          onClose={() => setActiveProduct(null)}
        />
      ) : null}
    </div>
  )
}

type ProductDetailDialogProps = {
  product: Product
  onClose: () => void
}

function ProductDetailDialog({ product, onClose }: ProductDetailDialogProps) {
  const category = categories.find((item) => item.id === product.categoryId)
  const subCategory = subCategories.find((item) => item.id === product.subCategoryId)

  return (
    <div className="product-modal" role="dialog" aria-modal="true" aria-labelledby="product-detail-title">
      <button className="modal-backdrop" onClick={onClose} type="button" aria-label="关闭商品详情" />
      <article className="modal-card">
        <button className="modal-close" onClick={onClose} type="button" aria-label="关闭">
          <X aria-hidden="true" size={18} />
        </button>

        <img alt={product.name} src={product.image} />

        <div className="modal-content">
          <header>
            <p className="eyebrow">商品知识</p>
            <h2 id="product-detail-title">{product.name}</h2>
            <span>
              {category?.name} / {subCategory?.name} · {product.origin}
            </span>
          </header>

          <p className="product-description">{product.description}</p>

          <div className="knowledge-grid">
            {product.knowledge.map((item) => (
              <section key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </section>
            ))}
          </div>
        </div>
      </article>
    </div>
  )
}

type CartPanelProps = {
  cartCount: number
  cartDetails: Array<CartItem & { product: Product; lineTotal: number; lineSavings: number }>
  onClear: () => void
  onQuantityChange: (productId: string, quantity: number) => void
  savings: number
  subtotal: number
  variant?: 'desktop' | 'drawer'
}

function CartPanel({
  cartCount,
  cartDetails,
  onClear,
  onQuantityChange,
  savings,
  subtotal,
  variant = 'desktop',
}: CartPanelProps) {
  return (
    <aside className={`cart-panel ${variant}`} aria-label="购物车汇总">
      <div className="cart-title">
        <div>
          <span className="cart-icon-wrap">
            <ShoppingBag aria-hidden="true" size={19} />
          </span>
          <div>
            <h2>购物车</h2>
            <span>{cartCount} 件商品</span>
          </div>
        </div>
        <button disabled={cartDetails.length === 0} onClick={onClear} type="button">
          清空
        </button>
      </div>

      <div className="cart-progress-card">
        <div>
          <span>{subtotal >= 88 ? '配送门槛已达成' : '配送门槛'}</span>
          <strong>{subtotal >= 88 ? '可安排配送' : `还差 ${formatCurrency(88 - subtotal)}`}</strong>
        </div>
        <div className="cart-progress-track" aria-hidden="true">
          <span style={{ width: `${Math.min((subtotal / 88) * 100, 100)}%` }} />
        </div>
      </div>

      <div className="cart-list">
        {cartDetails.length === 0 ? (
          <div className="empty-cart">
            <PackageOpen aria-hidden="true" size={34} />
            <strong>购物车为空</strong>
            <span>选择商品后，这里会显示数量、优惠和合计。</span>
          </div>
        ) : (
          cartDetails.map((item) => (
            <article className="cart-item" key={item.productId}>
              <img alt={item.product.name} src={item.product.image} />
              <div>
                <h3>{item.product.name}</h3>
                <p>{item.product.spec}</p>
                <strong>{formatCurrency(item.lineTotal)}</strong>
              </div>
              <div className="cart-item-actions">
                <div className="mini-stepper">
                  <button onClick={() => onQuantityChange(item.productId, item.quantity - 1)} type="button">
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => onQuantityChange(item.productId, item.quantity + 1)} type="button">
                    +
                  </button>
                </div>
                <button className="remove-button" onClick={() => onQuantityChange(item.productId, 0)} type="button">
                  删除
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="cart-summary">
        <div>
          <span>商品小计</span>
          <strong>{formatCurrency(subtotal)}</strong>
        </div>
        <div>
          <span>优惠金额</span>
          <strong className="saving">{formatCurrency(savings)}</strong>
        </div>
        <div className="total-row">
          <span>应付合计</span>
          <strong>{formatCurrency(subtotal)}</strong>
        </div>
      </div>

      <button className="checkout-button" disabled={cartDetails.length === 0} type="button">
        去结算
      </button>
    </aside>
  )
}

export default App
