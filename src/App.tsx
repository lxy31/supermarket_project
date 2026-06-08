import { useMemo, useRef, useState, type ChangeEvent, type FormEvent, type MouseEvent, type PointerEvent } from 'react'
import {
  ArrowUpDown,
  BadgePercent,
  Boxes,
  Check,
  ChevronDown,
  ClipboardList,
  Flame,
  ImagePlus,
  ListFilter,
  PackageOpen,
  Pencil,
  RotateCcw,
  ShoppingBag,
  TriangleAlert,
  X,
} from 'lucide-react'

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
  shelfStatus?: 'on' | 'off'
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
type ActiveModule = 'purchase' | 'management'
type ManagementTab = 'catalog' | 'create' | 'offShelf' | 'inventory'
type InventoryFilter = 'all' | 'normal' | 'low' | 'out'
type NewProductInput = Omit<Product, 'id' | 'categoryId' | 'subCategoryId'> & {
  categoryName: string
  subCategoryName: string
}

const updateLiquidLens = (event: PointerEvent<HTMLElement>) => {
  const target = event.currentTarget
  const rect = target.getBoundingClientRect()
  target.style.setProperty('--liquid-x', `${event.clientX - rect.left}px`)
  target.style.setProperty('--liquid-y', `${event.clientY - rect.top}px`)
  target.style.setProperty('--liquid-opacity', '1')
}

const resetLiquidLens = (event: PointerEvent<HTMLElement>) => {
  event.currentTarget.style.removeProperty('--liquid-opacity')
}

const initialCategories: Category[] = [
  { id: 'fresh', name: '生鲜果蔬', icon: 'F' },
  { id: 'meat', name: '肉禽蛋奶', icon: 'M' },
  { id: 'snack', name: '休闲零食', icon: 'S' },
  { id: 'drink', name: '酒水饮料', icon: 'D' },
  { id: 'daily', name: '日用百货', icon: 'H' },
]

const initialSubCategories: SubCategory[] = [
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

const initialProducts: Product[] = [
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

const managementSections: Array<{ value: ManagementTab; label: string }> = [
  { value: 'catalog', label: '商品列表' },
  { value: 'create', label: '新增商品' },
  { value: 'offShelf', label: '下架管理' },
  { value: 'inventory', label: '库存盘点' },
]

const managementSectionMeta: Record<ManagementTab, { icon: string; count: (products: Product[]) => string }> = {
  catalog: { icon: 'L', count: (products) => String(products.length) },
  create: { icon: '+', count: () => '' },
  offShelf: { icon: 'D', count: (products) => String(products.filter((product) => product.stock === 0).length) },
  inventory: { icon: 'I', count: () => '盘点' },
}

const normalizeName = (value: string) => value.trim().replace(/\s+/g, ' ')

const createCustomId = (prefix: string, name: string, offset: number) =>
  `${prefix}-${offset + 1}-${name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || Date.now().toString(36)}`

function App() {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [subCategories, setSubCategories] = useState<SubCategory[]>(initialSubCategories)
  const [activeModule, setActiveModule] = useState<ActiveModule>('purchase')
  const [activeManagementTab, setActiveManagementTab] = useState<ManagementTab>('catalog')
  const [selectedCategoryId, setSelectedCategoryId] = useState('all')
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState('all')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('default')
  const [activeQuickFilter, setActiveQuickFilter] = useState<QuickFilter>('all')
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCategoryNavOpen, setIsCategoryNavOpen] = useState(true)
  const [activeProduct, setActiveProduct] = useState<Product | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isSortOpen, setIsSortOpen] = useState(false)

  const cartMap = useMemo(() => new Map(cartItems.map((item) => [item.productId, item.quantity])), [cartItems])

  const visibleProducts = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase()

    const filtered = products.filter((product) => {
      if (product.shelfStatus === 'off') return false

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
  }, [activeQuickFilter, products, searchKeyword, selectedCategoryId, selectedSubCategoryId, sortBy])

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
    if (!product || product.stock === 0 || product.shelfStatus === 'off') return

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
    setActiveModule('purchase')
    setSelectedCategoryId(categoryId)
    setSelectedSubCategoryId('all')
    setIsCategoryNavOpen(true)
  }

  const resetProductView = () => {
    setActiveModule('purchase')
    setSelectedCategoryId('all')
    setSelectedSubCategoryId('all')
    setIsCategoryNavOpen((current) => !current)
  }

  const updateProductStock = (productId: string, nextStock: number) => {
    const safeStock = Math.max(0, Math.min(Math.round(nextStock), 999))
    setProducts((current) =>
      current.map((product) => (product.id === productId ? { ...product, stock: safeStock } : product)),
    )
    setCartItems((current) =>
      current
        .map((item) => (item.productId === productId ? { ...item, quantity: Math.min(item.quantity, safeStock) } : item))
        .filter((item) => item.quantity > 0),
    )
  }

  const updateProductShelfStatus = (productId: string, shelfStatus: Product['shelfStatus']) => {
    setProducts((current) =>
      current.map((product) => (product.id === productId ? { ...product, shelfStatus } : product)),
    )

    if (shelfStatus === 'off') {
      setCartItems((current) => current.filter((item) => item.productId !== productId))
    }
  }

  const saveProduct = (updatedProduct: Product) => {
    const safeStock = Math.max(0, Math.min(Math.round(updatedProduct.stock), 999))
    const safeProduct = {
      ...updatedProduct,
      price: Math.max(0, updatedProduct.price),
      originalPrice: updatedProduct.originalPrice ? Math.max(0, updatedProduct.originalPrice) : undefined,
      stock: safeStock,
    }

    setProducts((current) => current.map((product) => (product.id === safeProduct.id ? safeProduct : product)))
    setCartItems((current) =>
      current
        .map((item) =>
          item.productId === safeProduct.id ? { ...item, quantity: Math.min(item.quantity, safeStock) } : item,
        )
        .filter((item) => item.quantity > 0),
    )
    setActiveProduct((current) => (current?.id === safeProduct.id ? safeProduct : current))
    setEditingProduct(null)
  }

  const createProduct = (product: NewProductInput) => {
    const categoryName = normalizeName(product.categoryName) || '未分类商品'
    const subCategoryName = normalizeName(product.subCategoryName) || '常规'
    const existingCategory = categories.find((category) => category.name === categoryName)
    const category =
      existingCategory ?? {
        id: createCustomId('cat', categoryName, categories.length),
        name: categoryName,
        icon: categoryName.slice(0, 1).toUpperCase(),
      }
    const existingSubCategory = subCategories.find(
      (subCategory) => subCategory.categoryId === category.id && subCategory.name === subCategoryName,
    )
    const subCategory =
      existingSubCategory ?? {
        id: createCustomId('sub', subCategoryName, subCategories.length),
        categoryId: category.id,
        name: subCategoryName,
      }
    const nextNumber =
      products.reduce((highest, current) => {
        const numericId = Number(current.id.replace(/\D/g, ''))
        return Number.isNaN(numericId) ? highest : Math.max(highest, numericId)
      }, 0) + 1
    const safeStock = Math.max(0, Math.min(Math.round(product.stock), 999))
    const { categoryName: _categoryName, subCategoryName: _subCategoryName, ...productInfo } = product

    if (!existingCategory) {
      setCategories((current) => [...current, category])
    }

    if (!existingSubCategory) {
      setSubCategories((current) => [...current, subCategory])
    }

    setProducts((current) => [
      ...current,
      {
        ...productInfo,
        id: `p-${String(nextNumber).padStart(3, '0')}`,
        categoryId: category.id,
        subCategoryId: subCategory.id,
        price: Math.max(0, product.price),
        originalPrice: product.originalPrice ? Math.max(0, product.originalPrice) : undefined,
        stock: safeStock,
      },
    ])
    setActiveManagementTab('catalog')
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
          <div className={`nav-group ${activeModule === 'purchase' ? 'active' : ''} ${isCategoryNavOpen ? 'open' : ''}`}>
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
                      onPointerLeave={resetLiquidLens}
                      onPointerMove={updateLiquidLens}
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
                              onPointerLeave={resetLiquidLens}
                              onPointerMove={updateLiquidLens}
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
          <div className={`nav-group ${activeModule === 'management' ? 'active open' : ''}`}>
            <button
              aria-expanded={activeModule === 'management'}
              className="nav-primary"
              onClick={() => {
                setActiveModule('management')
                setIsCategoryNavOpen(false)
              }}
              type="button"
            >
              商品管理
              <ChevronDown aria-hidden="true" size={16} />
            </button>
            <div
              className="sidebar-categories management-subnav"
              aria-label="商品管理二级目录"
              hidden={activeModule !== 'management'}
            >
              {managementSections.map((section) => {
                const meta = managementSectionMeta[section.value]

                return (
                  <div className="category-branch" key={section.value}>
                    <button
                      className={activeManagementTab === section.value ? 'active' : ''}
                      onClick={() => {
                        setActiveModule('management')
                        setIsCategoryNavOpen(false)
                        setActiveManagementTab(section.value)
                      }}
                      onPointerLeave={resetLiquidLens}
                      onPointerMove={updateLiquidLens}
                      type="button"
                    >
                      <span className="category-icon">{meta.icon}</span>
                      <span>{section.label}</span>
                      {meta.count(products) ? <strong>{meta.count(products)}</strong> : null}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
          <a href="#orders">订单记录</a>
          <a href="#members">会员中心</a>
          <a href="#reports">经营报表</a>
        </nav>
      </aside>

      {activeModule === 'purchase' ? (
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
      ) : (
        <ProductManagementModule
          activeTab={activeManagementTab}
          categories={categories}
          onEditProduct={setEditingProduct}
          onCreateProduct={createProduct}
          onShelfStatusChange={updateProductShelfStatus}
          onStockChange={updateProductStock}
          onTabChange={setActiveManagementTab}
          products={products}
          subCategories={subCategories}
        />
      )}

      {activeModule === 'purchase' ? (
        <>
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
        </>
      ) : null}

      {activeProduct ? (
        <ProductDetailDialog
          categories={categories}
          product={activeProduct}
          onClose={() => setActiveProduct(null)}
          subCategories={subCategories}
        />
      ) : null}

      {editingProduct ? (
        <EditProductDialog
          categories={categories}
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={saveProduct}
          subCategories={subCategories}
        />
      ) : null}
    </div>
  )
}

type ProductDetailDialogProps = {
  categories: Category[]
  product: Product
  onClose: () => void
  subCategories: SubCategory[]
}

function ProductDetailDialog({ categories, product, onClose, subCategories }: ProductDetailDialogProps) {
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

type EditProductDialogProps = {
  categories: Category[]
  product: Product
  onClose: () => void
  onSave: (product: Product) => void
  subCategories: SubCategory[]
}

function EditProductDialog({ categories, product, onClose, onSave, subCategories }: EditProductDialogProps) {
  const [draft, setDraft] = useState({
    name: product.name,
    categoryId: product.categoryId,
    subCategoryId: product.subCategoryId,
    spec: product.spec,
    price: String(product.price),
    originalPrice: product.originalPrice ? String(product.originalPrice) : '',
    stock: String(product.stock),
    unit: product.unit,
    origin: product.origin,
    variety: product.variety,
    tags: product.tags?.join('、') ?? '',
    image: product.image,
    description: product.description,
  })

  const availableSubCategories = subCategories.filter((subCategory) => subCategory.categoryId === draft.categoryId)

  const updateDraft = (field: keyof typeof draft, value: string) => {
    setDraft((current) => {
      if (field === 'categoryId') {
        const nextSubCategory = subCategories.find((subCategory) => subCategory.categoryId === value)
        return {
          ...current,
          categoryId: value,
          subCategoryId: nextSubCategory?.id ?? current.subCategoryId,
        }
      }

      return { ...current, [field]: value }
    })
  }

  const handleImageFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateDraft('image', reader.result)
      }
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  const submitEdit = () => {
    const tags = draft.tags
      .split(/[、,，]/)
      .map((tag) => tag.trim())
      .filter(Boolean)

    onSave({
      ...product,
      name: draft.name.trim() || product.name,
      categoryId: draft.categoryId,
      subCategoryId: draft.subCategoryId,
      spec: draft.spec.trim() || product.spec,
      price: Number(draft.price) || 0,
      originalPrice: draft.originalPrice.trim() ? Number(draft.originalPrice) || undefined : undefined,
      stock: Number(draft.stock) || 0,
      unit: draft.unit.trim() || product.unit,
      origin: draft.origin.trim() || product.origin,
      variety: draft.variety.trim() || product.variety,
      tags: tags.length > 0 ? tags : undefined,
      image: draft.image.trim() || product.image,
      description: draft.description.trim() || product.description,
    })
  }

  const category = categories.find((item) => item.id === draft.categoryId)
  const subCategory = subCategories.find((item) => item.id === draft.subCategoryId)

  return (
    <div className="product-modal" role="dialog" aria-modal="true" aria-labelledby="edit-product-title">
      <button className="modal-backdrop" onClick={onClose} type="button" aria-label="关闭编辑商品" />
      <article className="edit-product-card">
        <aside
          className="edit-product-visual"
          style={{ backgroundImage: `url(${draft.image.trim() || product.image})` }}
          aria-label={product.name}
        >
          <div className="edit-product-visual-actions">
            <label className="image-upload-action" title="选择图片">
              <ImagePlus aria-hidden="true" size={16} />
              <span>选择图片</span>
              <input accept="image/*" type="file" onChange={handleImageFileChange} />
            </label>
            <button onClick={() => updateDraft('image', product.image)} title="恢复原图" type="button" aria-label="恢复原图">
              <RotateCcw aria-hidden="true" size={16} />
            </button>
          </div>
          <div className="edit-product-visual-copy">
            <span>{product.id.toUpperCase()}</span>
            <strong>{draft.name || product.name}</strong>
            <em>
              {category?.name} / {subCategory?.name}
            </em>
          </div>
        </aside>

        <div className="edit-product-rule" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <section className="edit-product-editor">
          <button className="modal-close edit-product-close" onClick={onClose} type="button" aria-label="关闭">
            <X aria-hidden="true" size={18} />
          </button>

          <header className="edit-product-header">
            <div>
              <p className="eyebrow">商品资料</p>
              <input
                aria-label="编辑商品名称"
                id="edit-product-title"
                value={draft.name}
                onChange={(event) => updateDraft('name', event.target.value)}
              />
            </div>
          </header>

          <div className="edit-product-body">
            <form className="edit-product-form">
            <label>
              <span>一级分类</span>
              <select value={draft.categoryId} onChange={(event) => updateDraft('categoryId', event.target.value)}>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>二级分类</span>
              <select
                value={draft.subCategoryId}
                onChange={(event) => updateDraft('subCategoryId', event.target.value)}
              >
                {availableSubCategories.map((subCategory) => (
                  <option key={subCategory.id} value={subCategory.id}>
                    {subCategory.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>销售属性</span>
              <input value={draft.spec} onChange={(event) => updateDraft('spec', event.target.value)} />
            </label>
            <label>
              <span>计量单位</span>
              <input value={draft.unit} onChange={(event) => updateDraft('unit', event.target.value)} />
            </label>
            <label>
              <span>售价</span>
              <input min={0} type="number" value={draft.price} onChange={(event) => updateDraft('price', event.target.value)} />
            </label>
            <label>
              <span>原价</span>
              <input
                min={0}
                placeholder="无促销原价可留空"
                type="number"
                value={draft.originalPrice}
                onChange={(event) => updateDraft('originalPrice', event.target.value)}
              />
            </label>
            <label>
              <span>库存</span>
              <input min={0} type="number" value={draft.stock} onChange={(event) => updateDraft('stock', event.target.value)} />
            </label>
            <label>
              <span>产地</span>
              <input value={draft.origin} onChange={(event) => updateDraft('origin', event.target.value)} />
            </label>
            <label className="edit-form-wide">
              <span>标签</span>
              <input
                value={draft.tags}
                onChange={(event) => updateDraft('tags', event.target.value)}
                placeholder="用顿号或逗号分隔"
              />
            </label>
            <label className="edit-form-wide">
              <span>商品描述</span>
              <textarea value={draft.description} onChange={(event) => updateDraft('description', event.target.value)} />
            </label>
            </form>
          </div>

          <footer className="edit-product-footer">
            <button onClick={onClose} type="button">
              取消
            </button>
            <button className="primary-action" onClick={submitEdit} type="button">
              保存修改
            </button>
          </footer>
        </section>
      </article>
    </div>
  )
}

type CatalogModuleProps = {
  categories: Category[]
  onEditProduct: (product: Product) => void
  products: Product[]
  subCategories: SubCategory[]
}

type ProductManagementModuleProps = {
  activeTab: ManagementTab
  categories: Category[]
  onCreateProduct: (product: NewProductInput) => void
  onEditProduct: (product: Product) => void
  onShelfStatusChange: (productId: string, shelfStatus: Product['shelfStatus']) => void
  onStockChange: (productId: string, stock: number) => void
  onTabChange: (tab: ManagementTab) => void
  products: Product[]
  subCategories: SubCategory[]
}

function ProductManagementModule({
  activeTab,
  categories,
  onCreateProduct,
  onEditProduct,
  onShelfStatusChange,
  onStockChange,
  onTabChange,
  products,
  subCategories,
}: ProductManagementModuleProps) {
  const statusLabel = managementSections.find((section) => section.value === activeTab)?.label ?? '商品列表'
  const offShelfCandidateCount = products.filter((product) => product.stock === 0).length
  const headerMeta =
    activeTab === 'catalog'
      ? ''
      : activeTab === 'offShelf'
        ? `${offShelfCandidateCount} 个待处理`
        : activeTab === 'inventory'
          ? '库存盘点'
          : statusLabel
  const pageDescription =
    activeTab === 'create'
      ? '创建商品资料，支持多级分类、图片上传、价格库存与销售说明。'
      : activeTab === 'catalog'
        ? '维护商品资料、分类、价格与上下架状态。'
        : activeTab === 'offShelf'
          ? '处理缺货与下架商品，复核仍可售库存。'
          : '盘点库存、补货优先级与库存金额。'

  return (
    <main className="workspace management-workspace" id="management">
      <header className="topbar">
        <div>
          <p className="eyebrow">商品管理</p>
          <h1>{statusLabel}</h1>
          <div className="store-context" aria-label="商品管理范围">
            <span>{pageDescription}</span>
          </div>
        </div>

        {activeTab === 'create' ? (
          <div className="header-actions" aria-label="新增商品操作">
            <button form="create-product-form" title="重置表单" type="reset">
              <RotateCcw aria-hidden="true" size={17} />
            </button>
            <button className="primary-action" form="create-product-form" title="提交新增" type="submit">
              <Check aria-hidden="true" size={18} />
            </button>
          </div>
        ) : headerMeta ? (
          <div className="store-meta">
            <span className="status-dot" aria-hidden="true" />
            <strong>{headerMeta}</strong>
          </div>
        ) : null}
      </header>

      <div className="mobile-management-tabs" aria-label="商品管理功能">
        {managementSections.map((tab) => (
          <button
            className={activeTab === tab.value ? 'active' : ''}
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'catalog' ? (
        <CatalogModule categories={categories} onEditProduct={onEditProduct} products={products} subCategories={subCategories} />
      ) : activeTab === 'create' ? (
        <CreateProductPanel categories={categories} onCreateProduct={onCreateProduct} subCategories={subCategories} />
      ) : activeTab === 'offShelf' ? (
        <OffShelfPanel
          categories={categories}
          onEditProduct={onEditProduct}
          onShelfStatusChange={onShelfStatusChange}
          products={products}
          subCategories={subCategories}
        />
      ) : (
        <InventoryModule categories={categories} products={products} onStockChange={onStockChange} subCategories={subCategories} />
      )}
    </main>
  )
}

function CatalogModule({ categories, onEditProduct, products, subCategories }: CatalogModuleProps) {
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState('all')
  const catalogListRef = useRef<HTMLDivElement | null>(null)
  const scrollFrameRef = useRef<number | null>(null)
  const scrollVelocityRef = useRef(0)

  const keyword = searchKeyword.trim().toLowerCase()
  const catalogRows = useMemo(
    () =>
      products.filter((product) => {
        const matchesCategory = selectedCategoryId === 'all' || product.categoryId === selectedCategoryId
        const matchesSearch =
          !keyword ||
          product.name.toLowerCase().includes(keyword) ||
          product.spec.toLowerCase().includes(keyword) ||
          product.variety.toLowerCase().includes(keyword)

        return matchesCategory && matchesSearch
      }),
    [keyword, products, selectedCategoryId],
  )

  const onShelfCount = products.filter((product) => product.stock > 0).length
  const offShelfCandidateCount = products.filter((product) => product.stock === 0).length
  const promoCount = products.filter((product) => Boolean(product.originalPrice)).length

  const stopCatalogAutoScroll = () => {
    scrollVelocityRef.current = 0

    if (scrollFrameRef.current !== null) {
      cancelAnimationFrame(scrollFrameRef.current)
      scrollFrameRef.current = null
    }
  }

  const runCatalogAutoScroll = () => {
    const list = catalogListRef.current

    if (!list || scrollVelocityRef.current === 0) {
      scrollFrameRef.current = null
      return
    }

    list.scrollTop += scrollVelocityRef.current
    scrollFrameRef.current = requestAnimationFrame(runCatalogAutoScroll)
  }

  const handleCatalogPointerMove = (event: MouseEvent<HTMLDivElement>) => {
    const list = catalogListRef.current

    if (!list) return

    const edgeSize = 96
    const rect = list.getBoundingClientRect()
    const distanceToTop = event.clientY - rect.top
    const distanceToBottom = rect.bottom - event.clientY
    const maxVelocity = 9
    let nextVelocity = 0

    if (distanceToBottom < edgeSize) {
      const intensity = Math.max(0, Math.min(1, (edgeSize - distanceToBottom) / edgeSize))
      nextVelocity = maxVelocity * intensity * intensity
    } else if (distanceToTop < edgeSize) {
      const intensity = Math.max(0, Math.min(1, (edgeSize - distanceToTop) / edgeSize))
      nextVelocity = -maxVelocity * intensity * intensity
    }

    scrollVelocityRef.current = nextVelocity

    if (nextVelocity === 0) {
      stopCatalogAutoScroll()
      return
    }

    if (scrollFrameRef.current === null) {
      scrollFrameRef.current = requestAnimationFrame(runCatalogAutoScroll)
    }
  }

  return (
    <div className="catalog-workspace" id="catalog">
      <section className="catalog-summary" aria-label="商品资料概览">
        <article>
          <span>全部 SKU</span>
          <strong>{products.length}</strong>
        </article>
        <article>
          <span>当前可售</span>
          <strong>{onShelfCount}</strong>
        </article>
        <article>
          <span>缺货待处理</span>
          <strong>{offShelfCandidateCount}</strong>
        </article>
        <article>
          <span>促销商品</span>
          <strong>{promoCount}</strong>
        </article>
      </section>

      <section className="catalog-panel" aria-label="商品资料列表">
        <div className="catalog-toolbar">
          <label className="search-box">
            <span>搜索商品</span>
            <input
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
              placeholder="商品名、规格或品类"
            />
          </label>

          <label className="inventory-select">
            <span>分类</span>
            <select value={selectedCategoryId} onChange={(event) => setSelectedCategoryId(event.target.value)}>
              <option value="all">全部分类</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div
          className="catalog-list"
          onMouseLeave={stopCatalogAutoScroll}
          onMouseMove={handleCatalogPointerMove}
          ref={catalogListRef}
        >
          {catalogRows.map((product) => {
            const category = categories.find((item) => item.id === product.categoryId)
            const subCategory = subCategories.find((item) => item.id === product.subCategoryId)
            const isOutOfStock = product.stock === 0

            return (
              <article
                className="catalog-item"
                key={product.id}
                onPointerLeave={resetLiquidLens}
                onPointerMove={updateLiquidLens}
                style={{ backgroundImage: `linear-gradient(90deg, rgba(255, 255, 255, 0.78) 0%, rgba(255, 255, 255, 0.92) 38%, rgba(255, 255, 255, 0.98) 100%), url(${product.image})` }}
              >
                <img alt={product.name} src={product.image} />
                <div className="catalog-item-main">
                  <div className="catalog-title-row">
                    <h3>{product.name}</h3>
                    <span>{product.id.toUpperCase()}</span>
                  </div>
                  <p>{product.variety}</p>
                  <div className="catalog-meta-line">
                    <span>
                      {category?.name} / {subCategory?.name}
                    </span>
                    <span>{product.spec}</span>
                    <span>{product.origin}</span>
                    <span>
                      库存 {product.stock}{product.unit}
                    </span>
                  </div>
                  <div className="catalog-label-row">
                    {(product.tags ?? ['常规']).map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
                <strong>{formatCurrency(product.price)}</strong>
                <span className={`catalog-state ${isOutOfStock ? 'off' : 'on'}`}>
                  {isOutOfStock ? '待下架处理' : '可售'}
                </span>
                <div className="catalog-item-actions">
                  <button
                    aria-label={`编辑${product.name}`}
                    onClick={() => onEditProduct(product)}
                    title="编辑"
                    type="button"
                  >
                    <Pencil aria-hidden="true" size={17} />
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}

type CreateProductPanelProps = {
  categories: Category[]
  onCreateProduct: (product: NewProductInput) => void
  subCategories: SubCategory[]
}

function CreateProductPanel({ categories, onCreateProduct, subCategories }: CreateProductPanelProps) {
  const defaultCategory = categories[0]
  const defaultSubCategory = defaultCategory
    ? subCategories.find((subCategory) => subCategory.categoryId === defaultCategory.id)
    : undefined
  const [categoryLevels, setCategoryLevels] = useState([
    defaultCategory?.name ?? '',
    defaultSubCategory?.name ?? '',
  ])
  const [draft, setDraft] = useState({
    name: '',
    categoryName: defaultCategory?.name ?? '',
    subCategoryName: defaultSubCategory?.name ?? '',
    image: '',
    spec: '',
    price: '',
    originalPrice: '',
    stock: '',
    unit: '',
    tags: '',
    origin: '',
    description: '',
  })
  const [formError, setFormError] = useState('')

  const selectedCategory = categories.find((category) => category.name === normalizeName(categoryLevels[0] ?? ''))
  const availableSubCategories = selectedCategory
    ? subCategories.filter((subCategory) => subCategory.categoryId === selectedCategory.id)
    : []
  const imagePreview = draft.image.trim()
  const selectedSubCategory = availableSubCategories.find(
    (subCategory) => subCategory.name === normalizeName(categoryLevels[1] ?? ''),
  )

  const updateDraft = (field: keyof typeof draft, value: string) => {
    setFormError('')
    setDraft((current) => {
      if (field === 'categoryName') {
        const nextCategory = categories.find((category) => category.name === normalizeName(value))
        const nextSubCategory = nextCategory
          ? subCategories.find((subCategory) => subCategory.categoryId === nextCategory.id)
          : undefined
        return {
          ...current,
          categoryName: value,
          subCategoryName: nextSubCategory?.name ?? '',
        }
      }

      return { ...current, [field]: value }
    })
  }

  const resetDraft = () => {
    const nextDefaultCategory = categories[0]
    const nextDefaultSubCategory = nextDefaultCategory
      ? subCategories.find((subCategory) => subCategory.categoryId === nextDefaultCategory.id)
      : undefined

    setCategoryLevels([nextDefaultCategory?.name ?? '', nextDefaultSubCategory?.name ?? ''])
    setFormError('')

    setDraft({
      name: '',
      categoryName: nextDefaultCategory?.name ?? '',
      subCategoryName: nextDefaultSubCategory?.name ?? '',
      image: '',
      spec: '',
      price: '',
      originalPrice: '',
      stock: '',
      unit: '',
      tags: '',
      origin: '',
      description: '',
    })
  }

  const updateCategoryLevel = (index: number, value: string) => {
    setFormError('')
    setCategoryLevels((current) => {
      const next = [...current]
      next[index] = value

      if (index === 0) {
        const nextCategory = categories.find((category) => category.name === normalizeName(value))
        const nextSubCategory = nextCategory
          ? subCategories.find((subCategory) => subCategory.categoryId === nextCategory.id)
          : undefined
        next[1] = nextSubCategory?.name ?? ''
        return next.slice(0, Math.max(2, next.length))
      }

      return next
    })
  }

  const addCategoryLevel = () => {
    setFormError('')
    setCategoryLevels((current) => [...current, ''])
  }

  const removeCategoryLevel = (index: number) => {
    setFormError('')
    setCategoryLevels((current) => current.filter((_, levelIndex) => levelIndex !== index))
  }

  const handleImageFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateDraft('image', reader.result)
      }
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  const submitProduct = () => {
    const tags = draft.tags
      .split(/[、,，]/)
      .map((tag) => tag.trim())
      .filter(Boolean)
    const name = draft.name.trim()
    const price = Number(draft.price)
    const stock = Number(draft.stock)
    const fallbackDescription = '新录入商品，可在商品资料中继续完善陈列、保存与推荐信息。'

    if (!name) {
      setFormError('请先填写商品名称，避免提交空商品。')
      return
    }

    if (draft.price.trim() === '' || Number.isNaN(price) || price <= 0) {
      setFormError('请填写有效售价，售价需要大于 0。')
      return
    }

    if (draft.stock.trim() === '' || Number.isNaN(stock) || stock < 0) {
      setFormError('请填写有效初始库存，库存不能小于 0。')
      return
    }

    onCreateProduct({
      name,
      categoryName: categoryLevels[0],
      subCategoryName: categoryLevels.slice(1).map(normalizeName).filter(Boolean).join(' / ') || availableSubCategories[0]?.name || '',
      image:
        imagePreview ||
        'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=640&q=80',
      spec: draft.spec.trim() || '常规属性',
      price,
      originalPrice: draft.originalPrice.trim() ? Number(draft.originalPrice) || undefined : undefined,
      stock,
      unit: draft.unit.trim() || '件',
      tags: tags.length > 0 ? tags : undefined,
      origin: draft.origin.trim() || '待补充',
      variety: selectedSubCategory?.name ?? (categoryLevels.slice(1).map(normalizeName).filter(Boolean).join(' / ') || '常规商品'),
      description: draft.description.trim() || fallbackDescription,
      knowledge: [
        { title: '商品定位', body: selectedSubCategory?.name ?? (categoryLevels.slice(1).map(normalizeName).filter(Boolean).join(' / ') || '常规商品') },
        { title: '陈列建议', body: draft.description.trim() || fallbackDescription },
        { title: '维护提示', body: '新增后可在商品列表中继续编辑价格、库存、标签和图片。' },
      ],
    })
    resetDraft()
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    submitProduct()
  }

  return (
    <section className="create-product-panel" aria-label="新增商品表单">
      {formError ? (
        <div className="product-form-alert" role="alert">
          <TriangleAlert aria-hidden="true" size={16} />
          <span>{formError}</span>
        </div>
      ) : null}

      <form
        className="product-form"
        id="create-product-form"
        noValidate
        onReset={(event) => {
          event.preventDefault()
          resetDraft()
        }}
        onSubmit={handleSubmit}
      >
        <div className="product-form-main">
          <fieldset className="product-form-section">
            <legend>基础信息</legend>
            <div className="product-form-grid single-column">
              <label>
                <span>商品名称</span>
                <input
                  aria-invalid={formError.includes('商品名称') || undefined}
                  value={draft.name}
                  onChange={(event) => updateDraft('name', event.target.value)}
                  placeholder="例如：有机西兰花"
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="product-form-section">
            <legend>分类与规格</legend>
            <div className="category-builder">
              {categoryLevels.map((level, index) => {
                const options =
                  index === 0
                    ? categories.map((category) => category.name)
                    : index === 1
                      ? availableSubCategories.map((subCategory) => subCategory.name)
                      : subCategories.map((subCategory) => subCategory.name)
                const listId = `create-category-level-${index}`

                return (
                  <label className="category-combo-field" key={index}>
                    <span>{index + 1}级分类</span>
                    <div className="category-combo">
                      <input
                        list={listId}
                        value={level}
                        onChange={(event) => updateCategoryLevel(index, event.target.value)}
                        placeholder={index === 0 ? '选择或新增一级分类' : '选择或新增下级分类'}
                      />
                      <ChevronDown aria-hidden="true" size={16} />
                      {index > 1 ? (
                        <button aria-label={`移除${index + 1}级分类`} onClick={() => removeCategoryLevel(index)} type="button">
                          <X aria-hidden="true" size={14} />
                        </button>
                      ) : null}
                    </div>
                    <datalist id={listId}>
                      {options.map((option) => (
                        <option key={option} value={option} />
                      ))}
                    </datalist>
                  </label>
                )
              })}
              <button className="add-category-level" onClick={addCategoryLevel} type="button">
                + 增加一级分类
              </button>
            </div>
            <div className="product-form-grid">
              <label>
                <span>销售属性</span>
                <input value={draft.spec} onChange={(event) => updateDraft('spec', event.target.value)} placeholder="颜色/尺码/重量等，例如：黑色 L" />
              </label>
              <label>
                <span>计量单位</span>
                <input value={draft.unit} onChange={(event) => updateDraft('unit', event.target.value)} placeholder="件 / 盒 / 瓶 / 套" />
              </label>
            </div>
          </fieldset>

          <fieldset className="product-form-section">
            <legend>价格与库存</legend>
            <div className="product-form-grid">
              <label>
                <span>售价</span>
                <input
                  aria-invalid={formError.includes('售价') || undefined}
                  min={0}
                  value={draft.price}
                  onChange={(event) => updateDraft('price', event.target.value)}
                  placeholder="0.00"
                  type="number"
                />
              </label>
              <label>
                <span>原价</span>
                <input
                  min={0}
                  value={draft.originalPrice}
                  onChange={(event) => updateDraft('originalPrice', event.target.value)}
                  placeholder="可留空"
                  type="number"
                />
              </label>
              <label>
                <span>初始库存</span>
                <input
                  aria-invalid={formError.includes('库存') || undefined}
                  min={0}
                  value={draft.stock}
                  onChange={(event) => updateDraft('stock', event.target.value)}
                  placeholder="0"
                  type="number"
                />
              </label>
              <label>
                <span>产地</span>
                <input value={draft.origin} onChange={(event) => updateDraft('origin', event.target.value)} placeholder="例如：山东寿光" />
              </label>
            </div>
          </fieldset>

          <fieldset className="product-form-section">
            <legend>销售说明</legend>
            <div className="product-form-grid single-column">
              <label>
                <span>标签</span>
                <input
                  value={draft.tags}
                  onChange={(event) => updateDraft('tags', event.target.value)}
                  placeholder="例如：促销、今日热销"
                />
              </label>
              <label>
                <span>商品描述</span>
                <textarea
                  value={draft.description}
                  onChange={(event) => updateDraft('description', event.target.value)}
                  placeholder="补充商品特点、陈列建议或保存方式"
                />
              </label>
            </div>
          </fieldset>
        </div>

        <aside className="product-form-side">
          <div className="product-form-group">
            <span>商品图片</span>
            <div
              className={`product-image-preview ${imagePreview ? '' : 'empty'}`}
              style={imagePreview ? { backgroundImage: `url(${imagePreview})` } : undefined}
              aria-label="商品图片预览"
            >
              <span>{imagePreview ? draft.name || '商品预览' : '暂无图片'}</span>
              <strong>
                {selectedCategory?.name ?? (normalizeName(categoryLevels[0] ?? '') || '新分类')} /{' '}
                {selectedSubCategory?.name ?? (categoryLevels.slice(1).map(normalizeName).filter(Boolean).join(' / ') || '新子类')}
              </strong>
              <div className="image-entry-actions">
                <label className="image-upload-action" title="选择图片">
                  <ImagePlus aria-hidden="true" size={16} />
                  <span>选择图片</span>
                  <input accept="image/*" type="file" onChange={handleImageFileChange} />
                </label>
                <button aria-label="清空图片" onClick={() => updateDraft('image', '')} title="清空图片" type="button">
                  <RotateCcw aria-hidden="true" size={16} />
                  <span>清空</span>
                </button>
              </div>
            </div>
          </div>

          <div className="product-preview-card" aria-label="新增商品预览">
            <div>
              <span>商品预览</span>
              <strong>{draft.name.trim() || '未命名商品'}</strong>
            </div>
            <dl>
              <div>
                <dt>分类</dt>
                <dd>
                  {selectedCategory?.name ?? (normalizeName(categoryLevels[0] ?? '') || '新分类')}
                  <span>/</span>
                  {selectedSubCategory?.name ?? (categoryLevels.slice(1).map(normalizeName).filter(Boolean).join(' / ') || '新子类')}
                </dd>
              </div>
              <div>
                <dt>售价</dt>
                <dd>{draft.price ? `¥${Number(draft.price).toFixed(2)}` : '待填写'}</dd>
              </div>
              <div>
                <dt>库存</dt>
                <dd>
                  {draft.stock || '0'}
                  {draft.unit.trim() || '件'}
                </dd>
              </div>
            </dl>
          </div>

          <div className="product-side-note">
            <PackageOpen aria-hidden="true" size={18} />
            <p>图片、名称、分类、售价和库存完善后，商品会以当前信息加入商品列表。</p>
          </div>
        </aside>
      </form>
    </section>
  )
}

type OffShelfPanelProps = {
  categories: Category[]
  onEditProduct: (product: Product) => void
  onShelfStatusChange: (productId: string, shelfStatus: Product['shelfStatus']) => void
  products: Product[]
  subCategories: SubCategory[]
}

type OffShelfFilter = 'all' | 'pending' | 'review' | 'off'

const getShelfState = (product: Product) => {
  if (product.shelfStatus === 'off') return { key: 'off' as const, label: '已下架', tone: 'danger' }
  if (product.stock === 0) return { key: 'pending' as const, label: '缺货待处理', tone: 'danger' }
  if (product.stock <= 8 && product.shelfStatus !== 'on') {
    return { key: 'review' as const, label: '低库存复核', tone: 'warning' }
  }
  return { key: 'active' as const, label: '可售', tone: 'success' }
}

function OffShelfPanel({ categories, onEditProduct, onShelfStatusChange, products, subCategories }: OffShelfPanelProps) {
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState('all')
  const [activeFilter, setActiveFilter] = useState<OffShelfFilter>('all')

  const keyword = searchKeyword.trim().toLowerCase()
  const pendingCount = products.filter((product) => getShelfState(product).key === 'pending').length
  const reviewCount = products.filter((product) => getShelfState(product).key === 'review').length
  const offShelfCount = products.filter((product) => getShelfState(product).key === 'off').length
  const activeCount = products.filter((product) => getShelfState(product).key === 'active').length
  const offShelfValue = products
    .filter((product) => getShelfState(product).key === 'off')
    .reduce((sum, product) => sum + product.price * product.stock, 0)

  const offShelfFilters = [
    { value: 'all', label: '全部商品', count: products.length },
    { value: 'pending', label: '缺货待处理', count: pendingCount },
    { value: 'review', label: '低库存复核', count: reviewCount },
    { value: 'off', label: '已下架', count: offShelfCount },
  ] as const

  const offShelfRows = useMemo(
    () =>
      products.filter((product) => {
        const state = getShelfState(product)
        const category = categories.find((item) => item.id === product.categoryId)
        const subCategory = subCategories.find((item) => item.id === product.subCategoryId)
        const matchesCategory = selectedCategoryId === 'all' || product.categoryId === selectedCategoryId
        const matchesStatus = activeFilter === 'all' || state.key === activeFilter
        const matchesSearch =
          !keyword ||
          product.name.toLowerCase().includes(keyword) ||
          product.spec.toLowerCase().includes(keyword) ||
          product.origin.toLowerCase().includes(keyword) ||
          category?.name.toLowerCase().includes(keyword) ||
          subCategory?.name.toLowerCase().includes(keyword)

        return matchesCategory && matchesStatus && matchesSearch
      }),
    [activeFilter, categories, keyword, products, selectedCategoryId, subCategories],
  )

  return (
    <section className="off-shelf-panel" aria-label="下架管理">
      <div className="section-heading">
        <div>
          <h2>下架管理</h2>
          <span>缺货商品优先处理，仍有库存的商品可先做人工复核</span>
        </div>
      </div>

      <section className="off-shelf-kpis" aria-label="下架概览">
        <article>
          <span>缺货待处理</span>
          <strong>{pendingCount}</strong>
        </article>
        <article>
          <span>低库存复核</span>
          <strong>{reviewCount}</strong>
        </article>
        <article>
          <span>已下架</span>
          <strong>{offShelfCount}</strong>
        </article>
        <article>
          <span>可售商品</span>
          <strong>{activeCount}</strong>
        </article>
      </section>

      <section className="off-shelf-toolbar" aria-label="下架筛选">
        <label className="search-box">
          <span>搜索商品</span>
          <input
            value={searchKeyword}
            onChange={(event) => setSearchKeyword(event.target.value)}
            placeholder="商品名、规格、分类或产地"
          />
        </label>

        <label className="inventory-select">
          <span>分类</span>
          <select value={selectedCategoryId} onChange={(event) => setSelectedCategoryId(event.target.value)}>
            <option value="all">全部分类</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      </section>

      <div className="off-shelf-tabs" aria-label="下架状态">
        {offShelfFilters.map((filter) => (
          <button
            className={activeFilter === filter.value ? 'active' : ''}
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            type="button"
          >
            <span>{filter.label}</span>
            <strong>{filter.count}</strong>
          </button>
        ))}
      </div>

      <section className="off-shelf-table" aria-label="下架商品列表">
        <div className="off-shelf-table-head">
          <span>商品</span>
          <span>分类</span>
          <span>库存</span>
          <span>状态</span>
          <span>操作</span>
        </div>

        <div className="off-shelf-table-body">
          {offShelfRows.length > 0 ? (
            offShelfRows.map((product) => {
              const state = getShelfState(product)
              const category = categories.find((item) => item.id === product.categoryId)
              const subCategory = subCategories.find((item) => item.id === product.subCategoryId)

              return (
                <article className="off-shelf-row" key={product.id}>
                  <div className="off-shelf-product">
                    <img alt={product.name} src={product.image} />
                    <div>
                      <h3>{product.name}</h3>
                      <p>{product.spec} · {product.origin}</p>
                    </div>
                  </div>
                  <span>{category?.name} / {subCategory?.name}</span>
                  <strong>
                    {product.stock}
                    {product.unit}
                  </strong>
                  <span className={`stock-status ${state.tone}`}>{state.label}</span>
                  <div className="off-shelf-actions">
                    <button aria-label={`编辑${product.name}`} onClick={() => onEditProduct(product)} type="button">
                      编辑
                    </button>
                    {state.key === 'off' ? (
                      <button className="primary-action" onClick={() => onShelfStatusChange(product.id, 'on')} type="button">
                        恢复可售
                      </button>
                    ) : (
                      <>
                        {state.key === 'review' ? (
                          <button className="primary-action" onClick={() => onShelfStatusChange(product.id, 'on')} type="button">
                            复核通过
                          </button>
                        ) : null}
                        <button className="danger-action" onClick={() => onShelfStatusChange(product.id, 'off')} type="button">
                          标记下架
                        </button>
                      </>
                    )}
                  </div>
                </article>
              )
            })
          ) : (
            <div className="off-shelf-empty">
              <PackageOpen aria-hidden="true" size={22} />
              <strong>没有匹配商品</strong>
              <span>调整搜索、分类或状态筛选后再查看。</span>
            </div>
          )}
        </div>
      </section>

      <aside className="off-shelf-note" aria-label="下架策略">
        <TriangleAlert aria-hidden="true" size={18} />
        <p>已下架商品会从购买页面隐藏，并自动从购物车移除。当前已下架库存金额为 {formatCurrency(offShelfValue)}。</p>
      </aside>
    </section>
  )
}

type InventoryModuleProps = {
  categories: Category[]
  onStockChange: (productId: string, stock: number) => void
  products: Product[]
  subCategories: SubCategory[]
}

const getInventoryStatus = (stock: number) => {
  if (stock === 0) return { key: 'out' as const, label: '缺货', tone: 'danger' }
  if (stock <= 8) return { key: 'low' as const, label: '需补货', tone: 'warning' }
  return { key: 'normal' as const, label: '正常', tone: 'success' }
}

function InventoryModule({ categories, products, onStockChange, subCategories }: InventoryModuleProps) {
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState('all')
  const [activeFilter, setActiveFilter] = useState<InventoryFilter>('all')

  const keyword = searchKeyword.trim().toLowerCase()
  const inventoryRows = useMemo(
    () =>
      products.filter((product) => {
        const status = getInventoryStatus(product.stock)
        const matchesCategory = selectedCategoryId === 'all' || product.categoryId === selectedCategoryId
        const matchesStatus = activeFilter === 'all' || status.key === activeFilter
        const matchesSearch =
          !keyword ||
          product.name.toLowerCase().includes(keyword) ||
          product.spec.toLowerCase().includes(keyword) ||
          product.origin.toLowerCase().includes(keyword)

        return matchesCategory && matchesStatus && matchesSearch
      }),
    [activeFilter, keyword, products, selectedCategoryId],
  )

  const stockTotal = products.reduce((sum, product) => sum + product.stock, 0)
  const lowStockCount = products.filter((product) => product.stock > 0 && product.stock <= 8).length
  const outOfStockCount = products.filter((product) => product.stock === 0).length
  const stockValue = products.reduce((sum, product) => sum + product.stock * product.price, 0)
  const restockRows = products
    .filter((product) => product.stock <= 8)
    .sort((first, second) => first.stock - second.stock)
    .slice(0, 5)

  const inventoryFilters = [
    { value: 'all', label: '全部商品', count: products.length },
    { value: 'normal', label: '库存正常', count: products.length - lowStockCount - outOfStockCount },
    { value: 'low', label: '需补货', count: lowStockCount },
    { value: 'out', label: '缺货', count: outOfStockCount },
  ] as const

  return (
    <div className="inventory-workspace" id="stock">
      <section className="inventory-kpis" aria-label="库存概览">
        <article>
          <Boxes aria-hidden="true" size={22} />
          <span>库存总数</span>
          <strong>{stockTotal}</strong>
        </article>
        <article>
          <TriangleAlert aria-hidden="true" size={22} />
          <span>需补货</span>
          <strong>{lowStockCount}</strong>
        </article>
        <article>
          <PackageOpen aria-hidden="true" size={22} />
          <span>缺货 SKU</span>
          <strong>{outOfStockCount}</strong>
        </article>
        <article>
          <ClipboardList aria-hidden="true" size={22} />
          <span>库存金额</span>
          <strong>{formatCurrency(stockValue)}</strong>
        </article>
      </section>

      <section className="inventory-layout">
        <div className="inventory-main">
          <section className="inventory-toolbar" aria-label="库存筛选">
            <label className="search-box">
              <span>搜索库存</span>
              <input
                value={searchKeyword}
                onChange={(event) => setSearchKeyword(event.target.value)}
                placeholder="商品名、规格或产地"
              />
            </label>

            <label className="inventory-select">
              <span>分类</span>
              <select value={selectedCategoryId} onChange={(event) => setSelectedCategoryId(event.target.value)}>
                <option value="all">全部分类</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          </section>

          <div className="inventory-tabs" aria-label="库存状态">
            {inventoryFilters.map((filter) => (
              <button
                className={activeFilter === filter.value ? 'active' : ''}
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                type="button"
              >
                <span>{filter.label}</span>
                <strong>{filter.count}</strong>
              </button>
            ))}
          </div>

          <section className="inventory-table-card" aria-label="库存列表">
            <div className="inventory-table-head">
              <span>商品</span>
              <span>分类</span>
              <span>售价</span>
              <span>库存</span>
              <span>状态</span>
            </div>

            <div className="inventory-table-body">
              {inventoryRows.map((product) => {
                const status = getInventoryStatus(product.stock)
                const category = categories.find((item) => item.id === product.categoryId)
                const subCategory = subCategories.find((item) => item.id === product.subCategoryId)

                return (
                  <article className="inventory-row" key={product.id}>
                    <div className="inventory-product">
                      <img alt={product.name} src={product.image} />
                      <div>
                        <h3>{product.name}</h3>
                        <p>{product.spec} · {product.origin}</p>
                      </div>
                    </div>
                    <span>{category?.name} / {subCategory?.name}</span>
                    <strong>{formatCurrency(product.price)}</strong>
                    <div className="stock-stepper" aria-label={`${product.name} 库存`}>
                      <button onClick={() => onStockChange(product.id, product.stock - 1)} type="button">
                        -
                      </button>
                      <input
                        aria-label="库存数量"
                        min={0}
                        onChange={(event) => onStockChange(product.id, Number(event.target.value))}
                        type="number"
                        value={product.stock}
                      />
                      <button onClick={() => onStockChange(product.id, product.stock + 1)} type="button">
                        +
                      </button>
                    </div>
                    <span className={`stock-status ${status.tone}`}>{status.label}</span>
                  </article>
                )
              })}
            </div>
          </section>
        </div>

        <aside className="restock-panel" aria-label="补货提醒">
          <div className="section-heading">
            <div>
              <h2>补货提醒</h2>
              <span>低于 8 件自动进入列表</span>
            </div>
          </div>

          <div className="restock-list">
            {restockRows.map((product) => (
              <article key={product.id}>
                <div>
                  <h3>{product.name}</h3>
                  <p>{product.spec}</p>
                </div>
                <strong>{product.stock === 0 ? '缺货' : `${product.stock} ${product.unit}`}</strong>
              </article>
            ))}
          </div>
        </aside>
      </section>
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
