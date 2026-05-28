import { PrismaClient, Category } from "@prisma/client";

const prisma = new PrismaClient();

const competitions = [
  {
    title: "TÜBİTAK 2209-A Üniversite Öğrencileri Araştırma Projeleri",
    organization: "TÜBİTAK",
    description:
      "Lisans ve ön lisans öğrencilerine yönelik bilimsel araştırma projelerini destekleyen program. Öğrencilerin araştırma kültürünü geliştirmek ve akademik deneyim kazanmalarını sağlamak amacıyla düzenlenmektedir.",
    category: Category.TUBITAK,
    reward: "7.500",
    currency: "TRY",
    deadline: new Date("2025-10-31"),
    applicationUrl: "https://e-bideb.tubitak.gov.tr",
    sourceUrl: "https://www.tubitak.gov.tr/tr/burslar/lisans/burs-programlari/icerik-2209-universite-ogrencileri-arastirma-projeleri-destekleme-programi",
    country: "Turkey",
    tags: ["research", "undergraduate", "academic", "tubitak"],
  },
  {
    title: "TÜBİTAK 2209-B Sanayi Odaklı Lisans Bitirme Tezi",
    organization: "TÜBİTAK",
    description:
      "Sanayinin ihtiyaç duyduğu alanlarda yürütülecek lisans bitirme tezi projelerine destek sağlayan program. Öğrenci-sanayi iş birliğini teşvik etmektedir.",
    category: Category.TUBITAK,
    reward: "10.000",
    currency: "TRY",
    deadline: new Date("2025-11-30"),
    applicationUrl: "https://e-bideb.tubitak.gov.tr",
    sourceUrl: "https://www.tubitak.gov.tr/tr/burslar/lisans/burs-programlari/icerik-2209-b",
    country: "Turkey",
    tags: ["industry", "thesis", "undergraduate", "tubitak"],
  },
  {
    title: "TÜBİTAK 1002-A Hızlı Destek Programı",
    organization: "TÜBİTAK",
    description:
      "Acil ve kısa vadeli Ar-Ge ihtiyaçlarını karşılamak üzere tasarlanmış, hızlı değerlendirme ve destek süreciyle öne çıkan araştırma programı.",
    category: Category.TUBITAK,
    reward: "150.000",
    currency: "TRY",
    deadline: new Date("2025-12-15"),
    applicationUrl: "https://ardeb.tubitak.gov.tr",
    sourceUrl: "https://www.tubitak.gov.tr/tr/destekler/akademik/ulusal-destek-programlari/icerik-1002",
    country: "Turkey",
    tags: ["r&d", "fast-support", "academic", "tubitak"],
  },
  {
    title: "TÜBİTAK 1501 Sanayi Ar-Ge Projeleri",
    organization: "TÜBİTAK",
    description:
      "Türk sanayi kuruluşlarının Ar-Ge proje harcamalarını destekleyen ve teknolojik gelişime katkı sağlamayı amaçlayan destek programı.",
    category: Category.TUBITAK,
    reward: "2.000.000",
    currency: "TRY",
    deadline: new Date("2025-09-30"),
    applicationUrl: "https://teydeb.tubitak.gov.tr",
    sourceUrl: "https://www.tubitak.gov.tr/tr/destekler/sanayi/ulusal-destek-programlari/icerik-1501",
    country: "Turkey",
    tags: ["industry", "r&d", "sme", "tubitak"],
  },
  {
    title: "TEKNOFEST 2025 Yapay Zeka Yarışması",
    organization: "TEKNOFEST",
    description:
      "Türkiye'nin en büyük teknoloji festivali kapsamında düzenlenen yapay zeka alanındaki proje yarışması. Katılımcılar gerçek hayat problemlerine yönelik AI çözümleri geliştirmektedir.",
    category: Category.AI_ML,
    reward: "500.000",
    currency: "TRY",
    deadline: new Date("2025-08-31"),
    applicationUrl: "https://teknofest.org/tr/yarismalar/yapay-zeka",
    sourceUrl: "https://teknofest.org",
    country: "Turkey",
    tags: ["ai", "teknofest", "machine-learning", "competition"],
  },
  {
    title: "TEKNOFEST 2025 Sağlıkta Yapay Zeka",
    organization: "TEKNOFEST",
    description:
      "Sağlık sektöründe yapay zeka uygulamalarını konu alan, hasta tanı ve tedavi süreçlerinde inovatif çözümler üreten projelere yönelik yarışma.",
    category: Category.AI_ML,
    reward: "300.000",
    currency: "TRY",
    deadline: new Date("2025-09-15"),
    applicationUrl: "https://teknofest.org/tr/yarismalar/saglikta-yapay-zeka",
    sourceUrl: "https://teknofest.org",
    country: "Turkey",
    tags: ["healthtech", "ai", "teknofest", "medical"],
  },
  {
    title: "TEKNOFEST 2025 İnsansız Kara Aracı",
    organization: "TEKNOFEST",
    description:
      "Otonom kara araçları tasarımı ve geliştirmesi üzerine odaklanan, savunma ve sivil kullanım senaryolarını içeren mühendislik yarışması.",
    category: Category.OTHER,
    reward: "400.000",
    currency: "TRY",
    deadline: new Date("2025-07-31"),
    applicationUrl: "https://teknofest.org/tr/yarismalar/insansiz-kara-araci",
    sourceUrl: "https://teknofest.org",
    country: "Turkey",
    tags: ["robotics", "autonomous", "teknofest", "defense"],
  },
  {
    title: "Devpost Global AI Hackathon",
    organization: "Devpost",
    description:
      "A global hackathon focused on building innovative AI-powered applications. Open to developers worldwide, with prizes for best use of AI APIs and novel problem-solving approaches.",
    category: Category.HACKATHON,
    reward: "50.000",
    currency: "USD",
    deadline: new Date("2025-10-15"),
    applicationUrl: "https://devpost.com/hackathons",
    sourceUrl: "https://devpost.com",
    country: "International",
    tags: ["ai", "hackathon", "global", "devpost"],
  },
  {
    title: "Kaggle ML Research Competition",
    organization: "Kaggle / Google",
    description:
      "A competitive machine learning challenge requiring participants to develop predictive models on real-world datasets. Top solutions are evaluated on held-out test sets.",
    category: Category.AI_ML,
    reward: "25.000",
    currency: "USD",
    deadline: new Date("2025-11-01"),
    applicationUrl: "https://kaggle.com/competitions",
    sourceUrl: "https://kaggle.com",
    country: "International",
    tags: ["ml", "data-science", "kaggle", "competition"],
  },
  {
    title: "Google Developer Challenge",
    organization: "Google",
    description:
      "Annual challenge for developers to build innovative applications using Google technologies including Cloud, AI, Maps, and Android platforms.",
    category: Category.HACKATHON,
    reward: "30.000",
    currency: "USD",
    deadline: new Date("2025-12-01"),
    applicationUrl: "https://developers.google.com/community/challenges",
    sourceUrl: "https://developers.google.com",
    country: "International",
    tags: ["google", "cloud", "android", "developer"],
  },
  {
    title: "AWS Build On Challenge",
    organization: "Amazon Web Services",
    description:
      "Build innovative cloud solutions using AWS services. Open to students and professionals globally. Focus areas include serverless, ML, and sustainability.",
    category: Category.HACKATHON,
    reward: "20.000",
    currency: "USD",
    deadline: new Date("2025-10-31"),
    applicationUrl: "https://aws.amazon.com/events/build-on",
    sourceUrl: "https://aws.amazon.com",
    country: "International",
    tags: ["aws", "cloud", "serverless", "hackathon"],
  },
  {
    title: "EU Horizon Europe Innovation Grant",
    organization: "European Commission",
    description:
      "Horizon Europe funds research and innovation to tackle climate change, help achieve the UN's Sustainable Development Goals, and boost EU competitiveness and growth.",
    category: Category.STARTUP,
    reward: "2.500.000",
    currency: "EUR",
    deadline: new Date("2025-09-17"),
    applicationUrl: "https://ec.europa.eu/info/funding-tenders/opportunities",
    sourceUrl: "https://ec.europa.eu/info/research-and-innovation/funding/horizon-europe",
    country: "Europe",
    tags: ["eu", "research", "innovation", "sustainability", "grant"],
  },
  {
    title: "Microsoft AI for Good",
    organization: "Microsoft",
    description:
      "Microsoft's initiative to empower nonprofits, researchers, and organizations with AI tools and grants to solve humanitarian, environmental, and health challenges.",
    category: Category.AI_ML,
    reward: "15.000",
    currency: "USD",
    deadline: new Date("2025-11-15"),
    applicationUrl: "https://www.microsoft.com/en-us/ai/ai-for-good",
    sourceUrl: "https://www.microsoft.com/en-us/ai/ai-for-good",
    country: "International",
    tags: ["microsoft", "ai", "nonprofit", "social-impact"],
  },
  {
    title: "Garanti BBVA Startathon",
    organization: "Garanti BBVA",
    description:
      "Fintech girişimcileri için düzenlenen, yenilikçi bankacılık ve finansal teknoloji çözümleri geliştirmeye odaklanan startup yarışması.",
    category: Category.STARTUP,
    reward: "100.000",
    currency: "TRY",
    deadline: new Date("2025-08-15"),
    applicationUrl: "https://startathon.garantibbva.com.tr",
    sourceUrl: "https://www.garantibbva.com.tr",
    country: "Turkey",
    tags: ["fintech", "startup", "banking", "garanti"],
  },
  {
    title: "Girişimcilik Vakfı Start-Up Turkey",
    organization: "Girişimcilik Vakfı",
    description:
      "Türkiye'nin önde gelen startup yarışması. Erken aşama girişimlere mentorluk, yatırım bağlantısı ve toplam ödül havuzu sunulmaktadır.",
    category: Category.STARTUP,
    reward: "250.000",
    currency: "TRY",
    deadline: new Date("2025-10-01"),
    applicationUrl: "https://www.startupturkey.com",
    sourceUrl: "https://www.girisimciliktemeli.com",
    country: "Turkey",
    tags: ["startup", "turkey", "entrepreneurship", "investment"],
  },
  {
    title: "Adobe Design Achievement Awards",
    organization: "Adobe",
    description:
      "Global competition celebrating the most promising student designers working in print, web, digital video, photography, and motion graphics.",
    category: Category.DESIGN,
    reward: "10.000",
    currency: "USD",
    deadline: new Date("2025-09-01"),
    applicationUrl: "https://www.adaa.com",
    sourceUrl: "https://www.adaa.com",
    country: "International",
    tags: ["design", "adobe", "student", "creative"],
  },
];

async function main() {
  console.log("Seeding database...");

  for (const competition of competitions) {
    await prisma.competition.upsert({
      where: { id: competition.title.toLowerCase().replace(/\s+/g, "-").slice(0, 25) },
      update: {},
      create: {
        ...competition,
        id: competition.title.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 25).replace(/-+$/g, ""),
      },
    });
  }

  console.log(`Seeded ${competitions.length} competitions.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
