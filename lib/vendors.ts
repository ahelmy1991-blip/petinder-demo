export type Category = 'restaurant' | 'cafe' | 'shop' | 'bakery' | 'juice' | 'sweets' | 'grocery'

export interface Product {
  id: string
  nameEn: string
  nameAr: string
  price: number
  emoji: string
  descEn: string
  descAr: string
}

export interface Story {
  id: string
  emoji: string
  bgGradient: string
  textEn: string
  textAr: string
}

export interface Vendor {
  id: string
  nameEn: string
  nameAr: string
  category: Category
  districtEn: string
  districtAr: string
  descEn: string
  descAr: string
  emoji: string
  bgGradient: string
  rating: number
  reviewCount: number
  deliveryTime: string
  minOrder: number
  phone: string
  products: Product[]
  stories: Story[]
  verified: boolean
  source: 'seeded' | 'scraped'
}

export const vendors: Vendor[] = [
  {
    id: 'koshary-tahrir',
    nameEn: 'Koshary El Tahrir',
    nameAr: 'كُشري التحرير',
    category: 'restaurant',
    districtEn: 'Downtown Cairo',
    districtAr: 'وسط البلد',
    descEn: "Cairo's most iconic koshary joint since 1950. The ultimate Egyptian comfort dish.",
    descAr: 'أشهر مطعم كشري في القاهرة منذ ١٩٥٠. الطبق الشعبي المصري الأصيل.',
    emoji: '🍜',
    bgGradient: 'from-amber-400 to-yellow-500',
    rating: 4.8,
    reviewCount: 2341,
    deliveryTime: '15-25',
    minOrder: 50,
    phone: '+20 2 2393 4455',
    verified: true,
    source: 'seeded',
    products: [
      { id: 'k1', nameEn: 'Koshary Small', nameAr: 'كشري صغير', price: 18, emoji: '🍚', descEn: 'Rice, lentils, pasta & tomato sauce', descAr: 'أرز وعدس ومكرونة وصلصة طماطم' },
      { id: 'k2', nameEn: 'Koshary Medium', nameAr: 'كشري وسط', price: 25, emoji: '🍚', descEn: 'Bigger serving with extra onions', descAr: 'حصة أكبر مع بصل مقرمش إضافي' },
      { id: 'k3', nameEn: 'Koshary Large', nameAr: 'كشري كبير', price: 35, emoji: '🍚', descEn: 'For the truly hungry', descAr: 'للجوع الحقيقي' },
      { id: 'k4', nameEn: 'Spicy Tomato Sauce', nameAr: 'صلصة حارة', price: 5, emoji: '🌶️', descEn: 'Extra hot tomato sauce', descAr: 'صلصة طماطم حارة إضافية' },
    ],
    stories: [
      { id: 'ks1', emoji: '🔥', bgGradient: 'from-red-500 to-orange-500', textEn: 'Today\'s special: Double topping free!', textAr: 'عرض اليوم: توبينج مضاعف مجاناً!' },
      { id: 'ks2', emoji: '🏆', bgGradient: 'from-amber-500 to-yellow-400', textEn: 'Voted #1 koshary in Cairo 2024', textAr: 'تم التصويت لنا كأفضل كشري في القاهرة ٢٠٢٤' },
    ],
  },
  {
    id: 'abou-el-sid',
    nameEn: 'Abou El Sid',
    nameAr: 'أبو السيد',
    category: 'restaurant',
    districtEn: 'Zamalek',
    districtAr: 'الزمالك',
    descEn: 'Authentic Egyptian cuisine in a beautiful 1940s setting. A Zamalek institution.',
    descAr: 'المطبخ المصري الأصيل في ديكور أربعينيات رائع. أيقونة الزمالك.',
    emoji: '🥘',
    bgGradient: 'from-red-700 to-rose-600',
    rating: 4.7,
    reviewCount: 1876,
    deliveryTime: '30-45',
    minOrder: 150,
    phone: '+20 2 2735 9640',
    verified: true,
    source: 'seeded',
    products: [
      { id: 'as1', nameEn: 'Molokhiya with Rabbit', nameAr: 'ملوخية بالأرانب', price: 95, emoji: '🍲', descEn: 'Traditional green soup with tender rabbit', descAr: 'الملوخية الخضراء التقليدية مع الأرانب الطرية' },
      { id: 'as2', nameEn: 'Stuffed Vine Leaves', nameAr: 'ورق عنب', price: 75, emoji: '🌿', descEn: 'Hand-rolled with spiced rice & minced meat', descAr: 'محشو يدوياً بالأرز المبهر واللحم المفروم' },
      { id: 'as3', nameEn: 'Fattah', nameAr: 'فتة', price: 110, emoji: '🍖', descEn: 'Rice, bread, lamb & garlic-vinegar sauce', descAr: 'أرز وخبز ولحم ضاني وصلصة ثوم وخل' },
      { id: 'as4', nameEn: 'Om Ali', nameAr: 'أم علي', price: 55, emoji: '🥧', descEn: 'Classic Egyptian bread pudding with cream', descAr: 'بودينج الخبز المصري الكلاسيكي بالقشطة' },
    ],
    stories: [
      { id: 'ss1', emoji: '🕯️', bgGradient: 'from-red-800 to-rose-700', textEn: 'Ramadan nights atmosphere every day', textAr: 'أجواء ليالي رمضان كل يوم' },
      { id: 'ss2', emoji: '🍽️', bgGradient: 'from-amber-700 to-red-600', textEn: 'New: Kofta & Hawawshi on the menu!', textAr: 'جديد: كفتة وحواوشي على القائمة!' },
    ],
  },
  {
    id: 'zooba',
    nameEn: 'Zooba',
    nameAr: 'زوبا',
    category: 'restaurant',
    districtEn: 'Zamalek',
    districtAr: 'الزمالك',
    descEn: 'Modern twist on Egyptian street food. Clean, fresh, and full of flavour.',
    descAr: 'لمسة عصرية على الأكل الشعبي المصري. نظيف وطازج ومليء بالنكهة.',
    emoji: '🥙',
    bgGradient: 'from-green-600 to-teal-500',
    rating: 4.6,
    reviewCount: 1203,
    deliveryTime: '20-30',
    minOrder: 80,
    phone: '+20 2 2736 0000',
    verified: true,
    source: 'seeded',
    products: [
      { id: 'z1', nameEn: 'Ful Medames Wrap', nameAr: 'رول فول مدمس', price: 55, emoji: '🌯', descEn: 'Creamy fava beans with tahini & herbs', descAr: 'فول مدمس كريمي بالطحينة والأعشاب' },
      { id: 'z2', nameEn: 'Taameya Sandwich', nameAr: 'ساندويتش طعمية', price: 40, emoji: '🥙', descEn: 'Egyptian falafel with tomato & tahini', descAr: 'طعمية مصرية مع طماطم وطحينة' },
      { id: 'z3', nameEn: 'Koshary Bowl', nameAr: 'بول كشري', price: 70, emoji: '🥗', descEn: 'Zooba\'s signature upmarket koshary', descAr: 'كشري زوبا المميز' },
      { id: 'z4', nameEn: 'Hibiscus Cooler', nameAr: 'عرق سوس كركديه', price: 35, emoji: '🌺', descEn: 'Fresh hibiscus & liquorice blend', descAr: 'مزيج كركديه وعرق سوس طازج' },
    ],
    stories: [
      { id: 'zs1', emoji: '🌿', bgGradient: 'from-green-600 to-emerald-500', textEn: 'All-day breakfast now available!', textAr: 'فطار على مدار اليوم متاح الآن!' },
      { id: 'zs2', emoji: '🚴', bgGradient: 'from-teal-600 to-green-500', textEn: 'Free delivery on orders over 200 EGP', textAr: 'توصيل مجاني للطلبات فوق ٢٠٠ جنيه' },
    ],
  },
  {
    id: 'fish-market',
    nameEn: 'Fish Market',
    nameAr: 'سوق السمك',
    category: 'restaurant',
    districtEn: 'Garden City',
    districtAr: 'جاردن سيتي',
    descEn: 'Choose your fish, choose your sauce. Cairo\'s freshest seafood experience.',
    descAr: 'اختر سمكتك واختر صلصتك. أطازج تجربة مأكولات بحرية في القاهرة.',
    emoji: '🐟',
    bgGradient: 'from-blue-500 to-cyan-400',
    rating: 4.5,
    reviewCount: 987,
    deliveryTime: '40-55',
    minOrder: 200,
    phone: '+20 2 2794 0000',
    verified: true,
    source: 'seeded',
    products: [
      { id: 'f1', nameEn: 'Grilled Sea Bass', nameAr: 'قاروص مشوي', price: 195, emoji: '🐠', descEn: 'Fresh Nile sea bass with herbs', descAr: 'قاروص طازج بالأعشاب' },
      { id: 'f2', nameEn: 'Fried Calamari', nameAr: 'كاليماري مقلي', price: 130, emoji: '🦑', descEn: 'Crispy calamari with tartar sauce', descAr: 'كاليماري مقرمش مع صلصة تارتار' },
      { id: 'f3', nameEn: 'Shrimp Tagine', nameAr: 'طاجن جمبري', price: 170, emoji: '🦐', descEn: 'Spiced shrimp in Egyptian clay pot', descAr: 'جمبري مبهر في طاجن فخاري مصري' },
    ],
    stories: [
      { id: 'fs1', emoji: '🎣', bgGradient: 'from-blue-600 to-teal-500', textEn: 'Fresh catch just arrived from Alexandria!', textAr: 'وصل الصيد الطازج للتو من الإسكندرية!' },
    ],
  },
  {
    id: 'nomad-gallery',
    nameEn: 'Nomad Gallery',
    nameAr: 'نوماد جاليري',
    category: 'shop',
    districtEn: 'Zamalek',
    districtAr: 'الزمالك',
    descEn: 'Curated Egyptian handcrafts, art, and souvenirs. Every piece tells a story.',
    descAr: 'حرف مصرية يدوية وفن وتذكارات مختارة بعناية. كل قطعة لها حكاية.',
    emoji: '🏺',
    bgGradient: 'from-orange-600 to-amber-500',
    rating: 4.9,
    reviewCount: 642,
    deliveryTime: '60-90',
    minOrder: 100,
    phone: '+20 2 2736 1917',
    verified: true,
    source: 'seeded',
    products: [
      { id: 'n1', nameEn: 'Hand-painted Ceramic Mug', nameAr: 'كوب خزف مرسوم يدوياً', price: 380, emoji: '☕', descEn: 'Unique geometric Nubian patterns', descAr: 'نقوش نوبية هندسية فريدة' },
      { id: 'n2', nameEn: 'Egyptian Cotton Scarf', nameAr: 'وشاح قطن مصري', price: 320, emoji: '🧣', descEn: 'Premium 100% Egyptian cotton', descAr: 'قطن مصري فاخر ١٠٠٪' },
      { id: 'n3', nameEn: 'Handmade Papyrus Art', nameAr: 'فن البردي اليدوي', price: 550, emoji: '📜', descEn: 'Authentic Pharaonic designs', descAr: 'تصاميم فرعونية أصيلة' },
      { id: 'n4', nameEn: 'Leather Notebook', nameAr: 'دفتر جلد', price: 450, emoji: '📔', descEn: 'Hand-stitched camel leather', descAr: 'جلد جمل مخيط يدوياً' },
    ],
    stories: [
      { id: 'ns1', emoji: '✨', bgGradient: 'from-orange-600 to-yellow-500', textEn: 'New Ramadan collection in store now!', textAr: 'مجموعة رمضان الجديدة في المتجر الآن!' },
      { id: 'ns2', emoji: '🎨', bgGradient: 'from-amber-600 to-orange-500', textEn: 'Meet the artisans this Friday 5-8pm', textAr: 'قابل الحرفيين الجمعة من ٥-٨ مساءً' },
    ],
  },
  {
    id: 'halwany-sayyed',
    nameEn: "Halwany El 3am Sayyed",
    nameAr: 'حلواني عم سيد',
    category: 'sweets',
    districtEn: 'Heliopolis',
    districtAr: 'مصر الجديدة',
    descEn: "Three generations of Cairo's best oriental sweets. Made fresh daily.",
    descAr: 'ثلاثة أجيال من أجود الحلويات الشرقية في القاهرة. مصنوعة طازجة يومياً.',
    emoji: '🍯',
    bgGradient: 'from-yellow-500 to-amber-400',
    rating: 4.9,
    reviewCount: 3102,
    deliveryTime: '25-40',
    minOrder: 60,
    phone: '+20 2 2415 8800',
    verified: true,
    source: 'seeded',
    products: [
      { id: 'h1', nameEn: 'Konafa bil Qashta', nameAr: 'كنافة بالقشطة', price: 110, emoji: '🥮', descEn: 'Crispy kunafa filled with cream', descAr: 'كنافة مقرمشة محشوة بالقشطة' },
      { id: 'h2', nameEn: 'Om Ali', nameAr: 'أم علي', price: 55, emoji: '🥧', descEn: 'Egyptian bread pudding with nuts', descAr: 'أم علي بالمكسرات' },
      { id: 'h3', nameEn: 'Basbousa', nameAr: 'بسبوسة', price: 18, emoji: '🍮', descEn: 'Semolina cake soaked in syrup', descAr: 'كيكة السميد المنقوعة في الشربات' },
      { id: 'h4', nameEn: 'Mixed Oriental Box 1kg', nameAr: 'صندوق حلويات مشكل كيلو', price: 240, emoji: '🎁', descEn: 'Assorted sweets — perfect gift', descAr: 'حلويات مشكلة — هدية مثالية' },
    ],
    stories: [
      { id: 'hs1', emoji: '🌙', bgGradient: 'from-yellow-600 to-amber-500', textEn: 'Special Ramadan qatayef now available!', textAr: 'قطايف رمضان الخاصة متوفرة الآن!' },
      { id: 'hs2', emoji: '🎂', bgGradient: 'from-amber-500 to-yellow-400', textEn: 'Order Eid sweets boxes — limited qty!', textAr: 'اطلب صناديق حلويات العيد — كميات محدودة!' },
    ],
  },
  {
    id: 'gad',
    nameEn: 'Gad Restaurant',
    nameAr: 'مطعم جاد',
    category: 'restaurant',
    districtEn: 'Multiple Locations',
    districtAr: 'فروع متعددة',
    descEn: 'Cairo\'s beloved fast-food chain. Serving ful, taameya & grills since 1946.',
    descAr: 'سلسلة الوجبات السريعة المحبوبة في القاهرة. نقدم الفول والطعمية والمشاوي منذ ١٩٤٦.',
    emoji: '🫓',
    bgGradient: 'from-green-700 to-emerald-600',
    rating: 4.4,
    reviewCount: 5621,
    deliveryTime: '15-25',
    minOrder: 40,
    phone: '+20 2 2393 0000',
    verified: true,
    source: 'seeded',
    products: [
      { id: 'g1', nameEn: 'Ful Sandwich', nameAr: 'ساندويتش فول', price: 22, emoji: '🥙', descEn: 'Seasoned fava beans in baladi bread', descAr: 'فول مدمس في خبز بلدي' },
      { id: 'g2', nameEn: 'Taameya Sandwich', nameAr: 'ساندويتش طعمية', price: 20, emoji: '🥙', descEn: 'Crispy falafel with salad & tahini', descAr: 'طعمية مقرمشة مع سلطة وطحينة' },
      { id: 'g3', nameEn: 'Mixed Grill Plate', nameAr: 'طبق مشاوي مشكل', price: 135, emoji: '🍖', descEn: 'Kofta, chicken & lamb chops', descAr: 'كفتة ودجاج وريش ضاني' },
      { id: 'g4', nameEn: 'Cheese Pie', nameAr: 'فطيرة جبن', price: 28, emoji: '🥐', descEn: 'Flaky pastry with white cheese', descAr: 'فطير هش بالجبن الأبيض' },
    ],
    stories: [
      { id: 'gs1', emoji: '🌅', bgGradient: 'from-green-700 to-teal-600', textEn: 'Breakfast deals from 7am every day', textAr: 'عروض الفطار من ٧ صباحاً كل يوم' },
    ],
  },
  {
    id: 'sabil-juice',
    nameEn: 'Sabil Juice Bar',
    nameAr: 'عصير سبيل',
    category: 'juice',
    districtEn: 'Downtown Cairo',
    districtAr: 'وسط البلد',
    descEn: 'Fresh-pressed juices from Egyptian farms. Natural, cold, and delicious.',
    descAr: 'عصائر طازجة من مزارع مصرية. طبيعية وباردة ولذيذة.',
    emoji: '🥭',
    bgGradient: 'from-orange-400 to-yellow-300',
    rating: 4.6,
    reviewCount: 889,
    deliveryTime: '10-20',
    minOrder: 30,
    phone: '+20 2 2390 5500',
    verified: false,
    source: 'seeded',
    products: [
      { id: 'sb1', nameEn: 'Sugarcane Juice', nameAr: 'عصير قصب', price: 18, emoji: '🌿', descEn: 'Fresh-pressed Egyptian sugarcane', descAr: 'قصب مصري معصور طازج' },
      { id: 'sb2', nameEn: 'Mango Juice', nameAr: 'عصير مانجو', price: 30, emoji: '🥭', descEn: 'Seasonal Sinai mango, no sugar added', descAr: 'مانجو سيناء الموسمية بدون سكر' },
      { id: 'sb3', nameEn: 'Guava Nectar', nameAr: 'عصير جوافة', price: 22, emoji: '🍈', descEn: 'Thick creamy guava juice', descAr: 'عصير جوافة كريمي كثيف' },
      { id: 'sb4', nameEn: 'Karkade (Hibiscus)', nameAr: 'كركديه', price: 15, emoji: '🌺', descEn: 'Chilled hibiscus tea — classic Cairo', descAr: 'كركديه مثلج — كلاسيكي القاهرة' },
    ],
    stories: [
      { id: 'sbs1', emoji: '☀️', bgGradient: 'from-orange-400 to-yellow-300', textEn: 'Beat the heat! Juices from 10 EGP today', textAr: 'اهزم الحر! عصائر من ١٠ جنيه اليوم' },
    ],
  },
  {
    id: 'ibn-jalad',
    nameEn: 'Ibn Jalad Spices',
    nameAr: 'ابن جلاد للتوابل',
    category: 'shop',
    districtEn: 'Khan El Khalili',
    districtAr: 'خان الخليلي',
    descEn: 'Premium Egyptian spices, herbs & teas from the heart of Islamic Cairo.',
    descAr: 'توابل وأعشاب وشاي مصري فاخر من قلب القاهرة الإسلامية.',
    emoji: '🌶️',
    bgGradient: 'from-red-600 to-orange-500',
    rating: 4.7,
    reviewCount: 410,
    deliveryTime: '45-60',
    minOrder: 80,
    phone: '+20 2 2590 7799',
    verified: false,
    source: 'seeded',
    products: [
      { id: 'ij1', nameEn: 'Saffron 1g', nameAr: 'زعفران ١ جرام', price: 200, emoji: '🌸', descEn: 'Pure Iranian saffron, best quality', descAr: 'زعفران إيراني خالص، أجود نوعية' },
      { id: 'ij2', nameEn: 'Egyptian Spice Blend', nameAr: 'تابل مصري مشكل', price: 50, emoji: '🫙', descEn: 'Secret family recipe for all meats', descAr: 'وصفة عائلية سرية لجميع اللحوم' },
      { id: 'ij3', nameEn: 'Dried Rose Petals 100g', nameAr: 'بتلات ورد مجففة ١٠٠ جم', price: 70, emoji: '🌹', descEn: 'Used in tea, cooking & potpourri', descAr: 'للشاي والطبخ والعطور' },
      { id: 'ij4', nameEn: 'Cinnamon Sticks 50g', nameAr: 'قرفة ٥٠ جم', price: 40, emoji: '🍂', descEn: 'Ceylon cinnamon from Aswan traders', descAr: 'قرفة سيلانية من تجار أسوان' },
    ],
    stories: [
      { id: 'ijs1', emoji: '🕌', bgGradient: 'from-red-700 to-orange-600', textEn: 'Live in the souq — visit us in Khan El Khalili', textAr: 'عيش في السوق — زورنا في خان الخليلي' },
      { id: 'ijs2', emoji: '🫖', bgGradient: 'from-orange-600 to-red-500', textEn: 'New: Ramadan special herbal tea blends', textAr: 'جديد: خلطات شاي أعشاب خاصة رمضان' },
    ],
  },
  {
    id: 'el-fishawi',
    nameEn: "El Fishawi Cafe",
    nameAr: 'مقهى الفيشاوي',
    category: 'cafe',
    districtEn: 'Khan El Khalili',
    districtAr: 'خان الخليلي',
    descEn: "Open since 1797. Cairo's oldest cafe — Naguib Mahfouz wrote here. Timeless.",
    descAr: 'مفتوح منذ ١٧٩٧. أقدم مقاهي القاهرة — كتب هنا نجيب محفوظ. لا يتغير.',
    emoji: '☕',
    bgGradient: 'from-stone-600 to-amber-700',
    rating: 4.6,
    reviewCount: 4200,
    deliveryTime: '20-35',
    minOrder: 50,
    phone: '+20 2 2590 6755',
    verified: true,
    source: 'seeded',
    products: [
      { id: 'ef1', nameEn: 'Turkish Coffee', nameAr: 'قهوة تركي', price: 35, emoji: '☕', descEn: 'Strong, unfiltered, served with lokum', descAr: 'قوية بدون تصفية، تقدم مع الراحة' },
      { id: 'ef2', nameEn: 'Mint Tea', nameAr: 'شاي بالنعناع', price: 28, emoji: '🍵', descEn: 'Fresh mint in traditional glass', descAr: 'نعناع طازج في كوب تقليدي' },
      { id: 'ef3', nameEn: 'Anise Tea', nameAr: 'يانسون', price: 25, emoji: '🌿', descEn: 'Classic Egyptian anise tisane', descAr: 'يانسون مصري كلاسيكي' },
      { id: 'ef4', nameEn: 'Shisha (Tobacco)', nameAr: 'شيشة', price: 130, emoji: '💨', descEn: 'Traditional flavoured waterpipe', descAr: 'شيشة تقليدية بالنكهات' },
    ],
    stories: [
      { id: 'efs1', emoji: '📖', bgGradient: 'from-stone-700 to-amber-800', textEn: 'Where Naguib Mahfouz took his morning coffee', textAr: 'هنا كان يتناول نجيب محفوظ قهوته الصباحية' },
      { id: 'efs2', emoji: '🌙', bgGradient: 'from-amber-800 to-stone-700', textEn: 'Open 24/7 — we never close', textAr: 'مفتوح ٢٤/٧ — لا نغلق أبداً' },
    ],
  },
  {
    id: 'maison-thomas',
    nameEn: 'Maison Thomas',
    nameAr: 'ميزون توماس',
    category: 'restaurant',
    districtEn: 'Zamalek',
    districtAr: 'الزمالك',
    descEn: "Cairo's oldest pizzeria since 1922. A Zamalek landmark loved by all generations.",
    descAr: 'أقدم مطعم بيتزا في القاهرة منذ ١٩٢٢. معلم الزمالك المحبوب لكل الأجيال.',
    emoji: '🍕',
    bgGradient: 'from-red-500 to-orange-400',
    rating: 4.5,
    reviewCount: 2890,
    deliveryTime: '25-40',
    minOrder: 120,
    phone: '+20 2 2735 7057',
    verified: true,
    source: 'seeded',
    products: [
      { id: 'mt1', nameEn: 'Margherita Pizza', nameAr: 'بيتزا مارغريتا', price: 230, emoji: '🍕', descEn: 'San Marzano tomatoes & mozzarella', descAr: 'طماطم سان مارزانو وموتزاريلا' },
      { id: 'mt2', nameEn: 'Pepperoni Pizza', nameAr: 'بيتزا ببيروني', price: 290, emoji: '🍕', descEn: 'Classic with generous pepperoni', descAr: 'كلاسيك مع ببيروني سخي' },
      { id: 'mt3', nameEn: 'Caesar Salad', nameAr: 'سلطة قيصر', price: 105, emoji: '🥗', descEn: 'Romaine, parmesan & house dressing', descAr: 'خس روماني وبارميزان وصلصة المطعم' },
    ],
    stories: [
      { id: 'mts1', emoji: '🍕', bgGradient: 'from-red-600 to-orange-500', textEn: 'Since 1922 — same recipe, same love', textAr: 'منذ ١٩٢٢ — نفس الوصفة ونفس الحب' },
    ],
  },
  {
    id: 'dekkaan-fallah',
    nameEn: 'Dekkaan El Fallah',
    nameAr: 'دكان الفلاح',
    category: 'grocery',
    districtEn: 'Dokki',
    districtAr: 'الدقي',
    descEn: 'Farm-direct organic produce, Egyptian dates, honey & natural products.',
    descAr: 'منتجات عضوية مباشرة من المزرعة، تمر مصري وعسل ومنتجات طبيعية.',
    emoji: '🧺',
    bgGradient: 'from-lime-600 to-green-500',
    rating: 4.7,
    reviewCount: 756,
    deliveryTime: '30-50',
    minOrder: 100,
    phone: '+20 2 3748 9900',
    verified: false,
    source: 'seeded',
    products: [
      { id: 'df1', nameEn: 'Egyptian Medjool Dates 500g', nameAr: 'تمر مجدول مصري ٥٠٠ جم', price: 95, emoji: '🌴', descEn: 'Premium Siwa oasis dates', descAr: 'تمر واحة سيوة الفاخر' },
      { id: 'df2', nameEn: 'Sidr Honey 400g', nameAr: 'عسل سدر ٤٠٠ جم', price: 180, emoji: '🍯', descEn: 'Raw monofloral honey from Sinai', descAr: 'عسل سدر خام من سيناء' },
      { id: 'df3', nameEn: 'Fresh Produce Box', nameAr: 'صندوق خضروات طازجة', price: 160, emoji: '🥦', descEn: 'Weekly seasonal veg & fruit box', descAr: 'صندوق خضار وفاكهة موسمية أسبوعي' },
    ],
    stories: [
      { id: 'dfs1', emoji: '🌱', bgGradient: 'from-lime-600 to-green-500', textEn: 'New season strawberries just harvested!', textAr: 'فراولة الموسم الجديد للتو من المزرعة!' },
    ],
  },
  {
    id: 'cilantro',
    nameEn: 'Cilantro Cafe',
    nameAr: 'مقهى سيلانترو',
    category: 'cafe',
    districtEn: 'Multiple Locations',
    districtAr: 'فروع متعددة',
    descEn: "Egypt's favourite specialty coffee chain. Great Wi-Fi, great vibes.",
    descAr: 'سلسلة قهوة المتخصصة المفضلة في مصر. واي فاي ممتاز وأجواء رائعة.',
    emoji: '☕',
    bgGradient: 'from-emerald-600 to-green-500',
    rating: 4.3,
    reviewCount: 6800,
    deliveryTime: '15-25',
    minOrder: 60,
    phone: '+20 2 2735 9000',
    verified: true,
    source: 'seeded',
    products: [
      { id: 'c1', nameEn: 'Flat White', nameAr: 'فلات وايت', price: 70, emoji: '☕', descEn: 'Double ristretto with steamed milk', descAr: 'ريسترتو مضاعف مع حليب مبخر' },
      { id: 'c2', nameEn: 'Caramel Latte', nameAr: 'لاتيه كراميل', price: 80, emoji: '🍮', descEn: 'Espresso, milk & caramel drizzle', descAr: 'إسبريسو وحليب وكراميل' },
      { id: 'c3', nameEn: 'Chocolate Fudge Cake', nameAr: 'كيكة شوكولاتة', price: 90, emoji: '🍰', descEn: 'Rich Belgian chocolate layer cake', descAr: 'كيكة شوكولاتة بلجيكية غنية' },
      { id: 'c4', nameEn: 'Cheese Croissant', nameAr: 'كرواسان جبن', price: 60, emoji: '🥐', descEn: 'Flaky buttery with melted cheese', descAr: 'هش وزبداني مع جبن مذاب' },
    ],
    stories: [
      { id: 'cs1', emoji: '💻', bgGradient: 'from-emerald-600 to-teal-500', textEn: 'Student special: Buy 2 get 1 free Mon-Wed', textAr: 'عرض الطلاب: اشتري ٢ خذ ١ الإثنين-الأربعاء' },
      { id: 'cs2', emoji: '🧊', bgGradient: 'from-teal-600 to-emerald-500', textEn: 'Iced drinks menu now available!', textAr: 'قائمة المشروبات المثلجة متوفرة الآن!' },
    ],
  },
  {
    id: 'momen',
    nameEn: "Mo'men",
    nameAr: 'مؤمن',
    category: 'restaurant',
    districtEn: 'Multiple Locations',
    districtAr: 'فروع متعددة',
    descEn: "Egypt's original fast food brand. Burgers & sandwiches done the Egyptian way.",
    descAr: 'علامة الوجبات السريعة المصرية الأصلية. برجر وساندويتشات على الطريقة المصرية.',
    emoji: '🍔',
    bgGradient: 'from-yellow-500 to-orange-400',
    rating: 4.2,
    reviewCount: 8900,
    deliveryTime: '20-30',
    minOrder: 60,
    phone: '+20 2 2393 8800',
    verified: true,
    source: 'seeded',
    products: [
      { id: 'm1', nameEn: 'Falafel Burger', nameAr: 'برجر طعمية', price: 60, emoji: '🍔', descEn: 'Egyptian falafel patty with all the toppings', descAr: 'باتي طعمية مصرية مع جميع الإضافات' },
      { id: 'm2', nameEn: 'Club Sandwich', nameAr: 'كلاب ساندويتش', price: 80, emoji: '🥪', descEn: 'Grilled chicken, turkey & cheese on toast', descAr: 'دجاج مشوي وتيركي وجبن على توست' },
      { id: 'm3', nameEn: 'Chicken Wrap', nameAr: 'راب دجاج', price: 70, emoji: '🌯', descEn: 'Grilled chicken strips in a flour wrap', descAr: 'شرائح دجاج مشوي في راب دقيق' },
    ],
    stories: [
      { id: 'ms1', emoji: '🍟', bgGradient: 'from-yellow-500 to-orange-400', textEn: 'Family meal deal — feed 4 for 280 EGP!', textAr: 'عرض الوجبة العائلية — أطعم ٤ بـ٢٨٠ جنيه!' },
    ],
  },
]

export function getVendorById(id: string): Vendor | undefined {
  return vendors.find(v => v.id === id)
}

export function getVendorsByCategory(category: Category): Vendor[] {
  return vendors.filter(v => v.category === category)
}

export function searchVendors(query: string): Vendor[] {
  const q = query.toLowerCase()
  return vendors.filter(v =>
    v.nameEn.toLowerCase().includes(q) ||
    v.nameAr.includes(q) ||
    v.districtEn.toLowerCase().includes(q) ||
    v.districtAr.includes(q) ||
    v.category.includes(q)
  )
}
