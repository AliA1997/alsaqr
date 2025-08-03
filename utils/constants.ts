import { Margin, Options, Resolution } from "react-to-pdf";
import { CreateListOrCommunityForm, UserRegisterForm } from "typings";

export const ROUTES_USER_CANT_ACCESS = [
  '/communities',
  '/bookmarks',
  '/lists',
  '/messages',
  '/notifications'
];

export const ROUTES_WIDGETS_HIDDEN = [
  "/messages"
]

export const MAX_BIO_LENGTH_FEED = 40;

export const MARITAL_STATUS_OPTIONS = [
  {
    label: "Single",
    value: 'single',
    description: ''
  },
  {
    label: "Married",
    value: 'married',
    description: ''
  },
  {
    label: "Divorced",
    value: 'divorced',
    description: ''
  },
  {
    label: "Widowed",
    value: 'widowed',
    description: ''
  }
];

export const RELIGION_OPTIONS = [
  {
    label: "Muslim",
    value: 'Muslim',
  },
  {
    label: "Christian",
    value: 'Christian',
  },
  {
    label: "Atheist",
    value: 'Atheist',
  },
  {
    label: "Agnostic",
    value: 'Agnostic',
  },
  {
    label: "Jew",
    value: 'Jew',
  },
  {
    label: "Prefer Not To Disclose",
    value: 'Prefer Not To Disclose',
  }
]

export const HOBBIES_OPTIONS = [
  // Creative & Artistic
  { value: "Painting/Drawing", label: "Painting/Drawing" },
  { value: "Photography", label: "Photography" },
  { value: "Sculpting/Pottery", label: "Sculpting/Pottery" },
  { value: "Writing (Poetry, Fiction, Blogging)", label: "Writing (Poetry, Fiction, Blogging)" },
  { value: "Graphic Design/Digital Art", label: "Graphic Design/Digital Art" },
  { value: "Calligraphy/Hand Lettering", label: "Calligraphy/Hand Lettering" },
  { value: "Knitting/Crocheting/Sewing", label: "Knitting/Crocheting/Sewing" },
  { value: "DIY Crafts/Upcycling", label: "DIY Crafts/Upcycling" },

  // Outdoor & Adventure
  { value: "Hiking/Trekking", label: "Hiking/Trekking" },
  { value: "Camping/Backpacking", label: "Camping/Backpacking" },
  { value: "Gardening/Urban Farming", label: "Gardening/Urban Farming" },
  { value: "Birdwatching", label: "Birdwatching" },
  { value: "Rock Climbing", label: "Rock Climbing" },
  { value: "Kayaking/Canoeing", label: "Kayaking/Canoeing" },
  { value: "Cycling/Mountain Biking", label: "Cycling/Mountain Biking" },
  { value: "Geocaching", label: "Geocaching" },

  // Sports & Fitness
  { value: "Yoga/Pilates", label: "Yoga/Pilates" },
  { value: "Running/Jogging", label: "Running/Jogging" },
  { value: "Swimming", label: "Swimming" },
  { value: "Martial Arts (Karate, Taekwondo, etc.)", label: "Martial Arts (Karate, Taekwondo, etc.)" },
  { value: "Dancing (Salsa, Hip-Hop, Ballet, etc.)", label: "Dancing (Salsa, Hip-Hop, Ballet, etc.)" },
  { value: "Weightlifting/Strength Training", label: "Weightlifting/Strength Training" },
  { value: "Team Sports (Soccer, Basketball, Volleyball)", label: "Team Sports (Soccer, Basketball, Volleyball)" },
  { value: "Skateboarding/Rollerblading", label: "Skateboarding/Rollerblading" },

  // Intellectual & Learning
  { value: "Reading (Fiction, Non-Fiction, Magazines)", label: "Reading (Fiction, Non-Fiction, Magazines)" },
  { value: "Learning a New Language", label: "Learning a New Language" },
  { value: "Chess/Board Games", label: "Chess/Board Games" },
  { value: "Puzzle Solving (Crosswords, Sudoku)", label: "Puzzle Solving (Crosswords, Sudoku)" },
  { value: "Astronomy/Stargazing", label: "Astronomy/Stargazing" },
  { value: "History Research", label: "History Research" },
  { value: "Philosophy Discussion", label: "Philosophy Discussion" },
  { value: "Podcasting", label: "Podcasting" },

  // Tech & Gaming
  { value: "Coding/Programming", label: "Coding/Programming" },
  { value: "Video Gaming (PC, Console, Mobile)", label: "Video Gaming (PC, Console, Mobile)" },
  { value: "Virtual Reality (VR) Experiences", label: "Virtual Reality (VR) Experiences" },
  { value: "3D Printing", label: "3D Printing" },
  { value: "Drone Flying/Photography", label: "Drone Flying/Photography" },
  { value: "Building PCs/Tech Tinkering", label: "Building PCs/Tech Tinkering" },
  { value: "AI/Machine Learning Projects", label: "AI/Machine Learning Projects" },
  { value: "Retro Gaming Collection", label: "Retro Gaming Collection" },

  // Music & Performance
  { value: "Playing an Instrument (Guitar, Piano, Violin, etc.)", label: "Playing an Instrument (Guitar, Piano, Violin, etc.)" },
  { value: "Singing/Choir", label: "Singing/Choir" },
  { value: "DJing/Music Production", label: "DJing/Music Production" },
  { value: "Beatboxing", label: "Beatboxing" },
  { value: "Theater/Acting", label: "Theater/Acting" },
  { value: "Stand-Up Comedy", label: "Stand-Up Comedy" },
  { value: "Magic Tricks/Illusions", label: "Magic Tricks/Illusions" },
  { value: "Collecting Vinyl Records", label: "Collecting Vinyl Records" },

  // Social & Community
  { value: "Volunteering", label: "Volunteering" },
  { value: "Book Clubs", label: "Book Clubs" },
  { value: "Board Game Nights", label: "Board Game Nights" },
  { value: "Meetup Groups (Themed Interests)", label: "Meetup Groups (Themed Interests)" },
  { value: "Karaoke Nights", label: "Karaoke Nights" },
  { value: "Wine/Beer Tasting", label: "Wine/Beer Tasting" },
  { value: "Cooking Clubs", label: "Cooking Clubs" },
  { value: "Travel Groups", label: "Travel Groups" },

  // Relaxation & Mindfulness
  { value: "Meditation", label: "Meditation" },
  { value: "Journaling", label: "Journaling" },
  { value: "Aromatherapy/Candle Making", label: "Aromatherapy/Candle Making" },
  { value: "Tea/Coffee Brewing", label: "Tea/Coffee Brewing" },
  { value: "Feng Shui/Home Organization", label: "Feng Shui/Home Organization" },
  { value: "Coloring Books (Adult)", label: "Coloring Books (Adult)" },
  { value: "Listening to Audiobooks/Podcasts", label: "Listening to Audiobooks/Podcasts" },
  { value: "Stargazing", label: "Stargazing" },

  // Collecting
  { value: "Stamps/Coins", label: "Stamps/Coins" },
  { value: "Comic Books/Manga", label: "Comic Books/Manga" },
  { value: "Action Figures/Figurines", label: "Action Figures/Figurines" },
  { value: "Sneakers", label: "Sneakers" },
  { value: "Antiques", label: "Antiques" },
  { value: "Trading Cards (Pokémon, MTG, etc.)", label: "Trading Cards (Pokémon, MTG, etc.)" },
  { value: "Vinyl Records/CDs", label: "Vinyl Records/CDs" },
  { value: "Postcards", label: "Postcards" }
];

export const PREFERRED_MADHAB_OPTIONS = [
  { value: 'Hanafi', label: 'Hanafi' },
  { value: "Shafi'i", label: "Shafi'i" },
  { value: 'Maliki', label: 'Maliki' },
  { value: 'Hanbali', label: 'Hanbali' },
  { value: "Salafi", label: "Salafi" },
  { value: "Prefer Not To Disclose", label: "Prefer Not To Disclose" },
];


export const FREQUENT_MASJID_OPTIONS = [
  {"label": "5 times a day (for prayers)", "value": "5 times a day (for prayers)"},
  {"label": "Daily", "value": "Daily"},
  {"label": "Several times a week", "value": "Several times a week"},
  {"label": "Once a week", "value": "Once a week"},
  {"label": "Every Jummah (Friday prayers)", "value": "Every Jummah (Friday prayers)"},
  {"label": "A few times a month", "value": "A few times a month"},
  {"label": "Only on Eid", "value": "Only on Eid"},
  {"label": "Rarely", "value": "Rarely"},
  {"label": "Never", "value": "Never"},
  {"label": "Other", "value": "Other"}
];

export const FAVORITE_QURAN_RECITER_OPTIONS = [
  { "label": "Abdul Basit Abdul Samad", "value": "Abdul Basit Abdul Samad" },
  { "label": "Mishary Rashid Alafasy", "value": "Mishary Rashid Alafasy" },
  { "label": "Saad Al-Ghamdi", "value": "Saad Al-Ghamdi" },
  { "label": "Abdurrahman As-Sudais", "value": "Abdurrahman As-Sudais" },
  { "label": "Saud Al-Shuraim", "value": "Saud Al-Shuraim" },
  { "label": "Maher Al-Muaiqly", "value": "Maher Al-Muaiqly" },
  { "label": "Mahmoud Khalil Al-Hussary", "value": "Mahmoud Khalil Al-Hussary" },
  { "label": "Muhammad Siddiq Al-Minshawi", "value": "Muhammad Siddiq Al-Minshawi" },
  { "label": "Fares Abbad", "value": "Fares Abbad" },
  { "label": "Hani Rifai", "value": "Hani Rifai" },
  { "label": "Yasser Al-Dosari", "value": "Yasser Al-Dosari" },
  { "label": "Abdullah Basfar", "value": "Abdullah Basfar" },
  { "label": "Ali Al-Hudhaifi", "value": "Ali Al-Hudhaifi" },
  { "label": "Tawfeeq As-Sayegh", "value": "Tawfeeq As-Sayegh" },
  { "label": "Mohammed Ayoub", "value": "Mohammed Ayoub" },
  { "label": "Khalid Al-Qahtani", "value": "Khalid Al-Qahtani" },
  { "label": "Ahmed Al-Ajmy", "value": "Ahmed Al-Ajmy" },
  { "label": "Abdullah Al-Juhany", "value": "Abdullah Al-Juhany" },
  { "label": "Ibrahim Al-Akhdar", "value": "Ibrahim Al-Akhdar" },
  { "label": "Muhammad Jibreel", "value": "Muhammad Jibreel" },
  { "label": "Abdul Wadud Haneef", "value": "Abdul Wadud Haneef" },
  { "label": "Husary Muallim", "value": "Husary Muallim" },
  { "label": "Muhammad Al-Luhaidan", "value": "Muhammad Al-Luhaidan" },
  { "label": "Nasser Al-Qatami", "value": "Nasser Al-Qatami" },
  { "label": "Bandar Baleela", "value": "Bandar Baleela" },
  { "label": "Yasir Al-Filfilani", "value": "Yasir Al-Filfilani" },
  { "label": "Aziz Alili", "value": "Aziz Alili" },
  { "label": "Idris Abkar", "value": "Idris Abkar" },
  { "label": "Fatih Seferagic", "value": "Fatih Seferagic" },
  { "label": "Omar Hisham Al Arabi", "value": "Omar Hisham Al Arabi" },
  { "label": "Other", "value": "Other" }
];

export const ISLAMIC_SCHOLARS_OPTIONS = [
  {"label": "Abu Hanifa / أبو حنيفة النعمان", "value": "Abu Hanifa / أبو حنيفة النعمان"},
  {"label": "Malik ibn Anas / مالك بن أنس", "value": "Malik ibn Anas / مالك بن أنس"},
  {"label": "Al-Shafi'i / الشافعي", "value": "Al-Shafi'i / الشافعي"},
  {"label": "Ahmad ibn Hanbal / أحمد بن حنبل", "value": "Ahmad ibn Hanbal / أحمد بن حنبل"},
  {"label": "Al-Bukhari / البخاري", "value": "Al-Bukhari / البخاري"},
  {"label": "Muslim ibn al-Hajjaj / مسلم بن الحجاج", "value": "Muslim ibn al-Hajjaj / مسلم بن الحجاج"},
  {"label": "Al-Tirmidhi / الترمذي", "value": "Al-Tirmidhi / الترمذي"},
  {"label": "Ibn Majah / ابن ماجه", "value": "Ibn Majah / ابن ماجه"},
  {"label": "Abu Dawood / أبو داود", "value": "Abu Dawood / أبو داود"},
  {"label": "Al-Nasa'i / النسائي", "value": "Al-Nasa'i / النسائي"},
  {"label": "Ibn Taymiyyah / ابن تيمية", "value": "Ibn Taymiyyah / ابن تيمية"},
  {"label": "Ibn Qayyim al-Jawziyya / ابن قيم الجوزية", "value": "Ibn Qayyim al-Jawziyya / ابن قيم الجوزية"},
  {"label": "Al-Ghazali / الغزالي", "value": "Al-Ghazali / الغزالي"},
  {"label": "Ibn Sina / ابن سينا", "value": "Ibn Sina / ابن سينا"},
  {"label": "Ibn Rushd / ابن رشد", "value": "Ibn Rushd / ابن رشد"},
  {"label": "Ibn Khaldun / ابن خلدون", "value": "Ibn Khaldun / ابن خلدون"},
  {"label": "Al-Tabari / الطبري", "value": "Al-Tabari / الطبري"},
  {"label": "Ibn Kathir / ابن كثير", "value": "Ibn Kathir / ابن كثير"},
  {"label": "Al-Suyuti / السيوطي", "value": "Al-Suyuti / السيوطي"},
  {"label": "Al-Qurtubi / القرطبي", "value": "Al-Qurtubi / القرطبي"},
  {"label": "Muhammad ibn Abdul Wahhab / محمد بن عبد الوهاب", "value": "Muhammad ibn Abdul Wahhab / محمد بن عبد الوهاب"},
  {"label": "Rashid Rida / رشيد رضا", "value": "Rashid Rida / رشيد رضا"},
  {"label": "Hassan al-Banna / حسن البنا", "value": "Hassan al-Banna / حسن البنا"},
  {"label": "Sayyid Qutb / سيد قطب", "value": "Sayyid Qutb / سيد قطب"},
  {"label": "Yusuf al-Qaradawi / يوسف القرضاوي", "value": "Yusuf al-Qaradawi / يوسف القرضاوي"},
  {"label": "Muhammad Nasiruddin al-Albani / محمد ناصر الدين الألباني", "value": "Muhammad Nasiruddin al-Albani / محمد ناصر الدين الألباني"},
  {"label": "Abdullah ibn Baz / عبد الله بن باز", "value": "Abdullah ibn Baz / عبد الله بن باز"},
  {"label": "Muhammad ibn al-Uthaymeen / محمد بن صالح العثيمين", "value": "Muhammad ibn al-Uthaymeen / محمد بن صالح العثيمين"},
  {"label": "Tariq Ramadan / طارق رمضان", "value": "Tariq Ramadan / طارق رمضان"},
  {"label": "Zakir Naik / زاكر نايك", "value": "Zakir Naik / زاكر نايك"},
  {"label": "Jalaluddin Rumi / جلال الدين الرومي", "value": "Jalaluddin Rumi / جلال الدين الرومي"},
  {"label": "Ibn Arabi / ابن عربي", "value": "Ibn Arabi / ابن عربي"},
  {"label": "Al-Junayd / الجنيد البغدادي", "value": "Al-Junayd / الجنيد البغدادي"},
  {"label": "Abdul Qadir Gilani / عبد القادر الجيلاني", "value": "Abdul Qadir Gilani / عبد القادر الجيلاني"},
  {"label": "Ahmad al-Tijani / أحمد التيجاني", "value": "Ahmad al-Tijani / أحمد التيجاني"},
  {"label": "Aisha bint Abu Bakr / عائشة بنت أبي بكر", "value": "Aisha bint Abu Bakr / عائشة بنت أبي بكر"},
  {"label": "Fatima al-Fihri / فاطمة الفهري", "value": "Fatima al-Fihri / فاطمة الفهري"},
  {"label": "Umm al-Darda / أم الدرداء", "value": "Umm al-Darda / أم الدرداء"},
  {"label": "Rabia al-Adawiyya / رابعة العدوية", "value": "Rabia al-Adawiyya / رابعة العدوية"},
  {"label": "Shuhda al-Baghdadiyya / شهدة البغدادية", "value": "Shuhda al-Baghdadiyya / شهدة البغدادية"},
  {"label": "Zaynab bint Kamal / زينب بنت كمال", "value": "Zaynab bint Kamal / زينب بنت كمال"},
  {"label": "Aisha Abdurrahman (Bint al-Shati) / عائشة عبد الرحمن (بنت الشاطئ)", "value": "Aisha Abdurrahman (Bint al-Shati) / عائشة عبد الرحمن (بنت الشاطئ)"},
  {"label": "Zainab Alwani / زينب العلواني", "value": "Zainab Alwani / زينب العلواني"},
  {"label": "Other / أخرى", "value": "Other / أخرى"}
]

export const ISLAMIC_STUDY_TOPICS_OPTIONS = [
  // Quranic Studies
  { "label": "Quran Memorization (Hifz) / حفظ القرآن", "value": "Quran Memorization (Hifz) / حفظ القرآن" },
  { "label": "Tajweed Rules / أحكام التجويد", "value": "Tajweed Rules / أحكام التجويد" },
  { "label": "Tafsir (Quranic Exegesis) / تفسير القرآن", "value": "Tafsir (Quranic Exegesis) / تفسير القرآن" },
  { "label": "Asbab al-Nuzul (Reasons for Revelation) / أسباب النزول", "value": "Asbab al-Nuzul (Reasons for Revelation) / أسباب النزول" },
  { "label": "Quranic Arabic / اللغة العربية القرآنية", "value": "Quranic Arabic / اللغة العربية القرآنية" },

  // Hadith & Sunnah
  { "label": "Hadith Sciences / علوم الحديث", "value": "Hadith Sciences / علوم الحديث" },
  { "label": "40 Hadith Collections / الأربعون النووية", "value": "40 Hadith Collections / الأربعون النووية" },
  { "label": "Sahih al-Bukhari & Muslim / صحيح البخاري ومسلم", "value": "Sahih al-Bukhari & Muslim / صحيح البخاري ومسلم" },
  { "label": "Understanding Hadith Terminology / مصطلح الحديث", "value": "Understanding Hadith Terminology / مصطلح الحديث" },
  { "label": "Prophetic Biography (Seerah) / السيرة النبوية", "value": "Prophetic Biography (Seerah) / السيرة النبوية" },

  // Aqeedah Islamic Creed
  { "label": "Tawheed (Monotheism) / التوحيد", "value": "Tawheed (Monotheism) / التوحيد" },
  { "label": "Names & Attributes of Allah / أسماء الله وصفاته", "value": "Names & Attributes of Allah / أسماء الله وصفاته" },
  { "label": "Eemaan (Faith) & Its Pillars / الإيمان وأركانه", "value": "Eemaan (Faith) & Its Pillars / الإيمان وأركانه" },
  { "label": "Protection from Shirk / التحذير من الشرك", "value": "Protection from Shirk / التحذير من الشرك" },
  { "label": "Day of Judgment / اليوم الآخر", "value": "Day of Judgment / اليوم الآخر" },

  // Fiqh & Islamic Jurisprudence
  { "label": "Purification (Taharah) / الطهارة", "value": "Purification (Taharah) / الطهارة" },
  { "label": "Prayer (Salah) / الصلاة", "value": "Prayer (Salah) / الصلاة" },
  { "label": "Fasting (Sawm) / الصيام", "value": "Fasting (Sawm) / الصيام" },
  { "label": "Zakat & Charity / الزكاة والصدقة", "value": "Zakat & Charity / الزكاة والصدقة" },
  { "label": "Hajj & Umrah / الحج والعمرة", "value": "Hajj & Umrah / الحج والعمرة" },

  // Islamic Morals & Spirtuality
  { "label": "Purification of the Heart (Tazkiyah) / تزكية النفس", "value": "Purification of the Heart (Tazkiyah) / تزكية النفس" },
  { "label": "Dua & Dhikr / الدعاء والذكر", "value": "Dua & Dhikr / الدعاء والذكر" },
  { "label": "Patience & Gratitude / الصبر والشكر", "value": "Patience & Gratitude / الصبر والشكر" },
  { "label": "Islamic Etiquette (Adab) / الآداب الإسلامية", "value": "Islamic Etiquette (Adab) / الآداب الإسلامية" },
  { "label": "Dealing with Trials / التعامل مع الابتلاءات", "value": "Dealing with Trials / التعامل مع الابتلاءات" },

  // Dawah and Contemporary Issues
  { "label": "Comparative Religion / مقارنة الأديان", "value": "Comparative Religion / مقارنة الأديان" },
  { "label": "Answering Misconceptions / رد الشبهات", "value": "Answering Misconceptions / رد الشبهات" },
  { "label": "Islam & Science / الإسلام والعلم", "value": "Islam & Science / الإسلام والعلم" },
  { "label": "Islamic Finance / الاقتصاد الإسلامي", "value": "Islamic Finance / الاقتصاد الإسلامي" },
  { "label": "Family & Marriage in Islam / الأسرة والزواج في الإسلام", "value": "Family & Marriage in Islam / الأسرة والزواج في الإسلام" },
  { "label": "Other / أخرى", "value": "Other / أخرى" }
]

export const DEFAULT_USER_REGISTRATION_FORM: UserRegisterForm = {
  username: "",
  avatar: "",
  bgThumbnail: "",
  email: "",
  bio: "",
  firstName: "",
  lastName: "",
  dateOfBirth: undefined,
  maritalStatus: undefined,
  hobbies: [],
  religion: "",
  countryOfOrigin: undefined,
  followingUsers: []
};

export const DEFAULT_CREATED_LIST_OR_COMMUNITY_FORM: CreateListOrCommunityForm = {
  name: "",
  avatarOrBannerImage: "",
  isPrivate: "public",
  tags: [],
  usersAdded: [],
  postsAdded: []
};

export const ROUTE_TO_SHOW_SETTINGS_SIDEBAR = '/settings';
export const DELETE_YOUR_ACCOUNT = 'Delete Your Account';

export const REACT_TO_PDF_CONFIG: Options = {
   // default is `save`
   method: 'open',
   // default is Resolution.MEDIUM = 3, which should be enough, higher values
   // increases the image quality but also the size of the PDF, so be careful
   // using values higher than 10 when having multiple pages generated, it
   // might cause the page to crash or hang.
   resolution: Resolution.HIGH,
   page: {
      // margin is in MM, default is Margin.NONE = 0
      margin: Margin.LARGE,
      // default is 'A4'
      format: 'letter',
      // default is 'portrait'
      orientation: 'portrait',
   },
   canvas: {
      // default is 'image/jpeg' for better size performance
      mimeType: 'image/png',
      qualityRatio: 1,
   },
   // Customize any value passed to the jsPDF instance and html2canvas
   // function. You probably will not need this and things can break, 
   // so use with caution.
   overrides: {
      // see https://artskydj.github.io/jsPDF/docs/jsPDF.html for more options
      pdf: {
         compress: true
      },
      // see https://html2canvas.hertzen.com/configuration for more options
      canvas: {
         useCORS: true
      }
   },
};

export const INVITATION_EXPIRE_TIME = (24 * 60 * 60 * 1000) * 3

export const FALLBACK_IMAGE_URL = "https://res.cloudinary.com/aa1997/image/upload/v1720130142/Web3-Client-Projects/Gm.png";