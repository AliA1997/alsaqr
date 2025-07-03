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
