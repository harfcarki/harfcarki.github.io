/*
 * Harf Oyunu - Kategori kontrolü
 * HarfKategori.kontrol(soru, cevap [, kategori]) -> { durum, kelime, kategori, etiket }
 *   durum: "gecersiz"  = cevap sözlükte olmayan/anlamsız bir şey (sozlukYukle ile sözlük yüklüyse)
 *          "uygun"     = cevap beklenen kategoride
 *          "uyumsuz"   = cevap BAŞKA bir kategoride biliniyor (örn. mutfakta -> araba): uyar, puan verme
 *          "bilinmiyor"= hiçbir listede yok: kabul edilir (karar verilemez)
 *          "serbest"   = bu soruda kategori kontrolü yok
 * HarfKategori.ekle("isim", ["Ahmet","Ayşe"])  -> kendi listenizi ekleyin
 * HarfKategori.sozlukYukle(["abacı","abajur",...]) -> kelime sözlüğü (yüklenince anlamsız cevaplar reddedilir)
 */
(function (g) {
  "use strict";
  var TUR = function (s) { return s.toLocaleLowerCase("tr"); };
  var L = function (s) { return s.split(/\s+/).filter(Boolean); };

  var VERI = {
    yemek: L("çorba mercimek ezogelin tarhana yayla işkembe paça kebap kebabı adana urfa iskender döner dürüm lahmacun pide köfte nohut barbunya pilav bulgur pirinç makarna spagetti mantı erişte börek gözleme menemen omlet yumurta sahanda haşlama peynir lor tulum kaşar zeytin reçel bal pekmez tahin tereyağı kaymak simit poğaça açma ekmek lavaş bazlama yufka tost sandviç hamburger pizza patates kızartma püre musakka karnıyarık dolma sarma imambayıldı türlü güveç tavuk piliç balık et biftek pirzola kuzu kıyma sucuk pastırma sosis salam jambon şiş tantuni çiğköfte kokoreç midye hamsi salata cacık turşu yoğurt kavurma mücver ciğer hellim humus falafel sushi noodle wrap krep waffle pankek çerez fındık fıstık ceviz badem leblebi çekirdek kuruyemiş cips kraker gevrek müsli granola yulaf hindi ördek yemek yemeği etli sulu kuru çiğ sarımsak hotdog nugget cheddar kaşar mısır patlamış lahmacun sütlü bulama bazlama kete lokma gözleme pilavı"),
    sebze: L("domates salatalık biber patlıcan kabak patates soğan sarımsak havuç pırasa ıspanak marul roka maydanoz dereotu nane tere turp pancar kereviz karnabahar brokoli lahana bezelye fasulye bamya mısır enginar kuşkonmaz mantar semizotu kırmızıbiber ısırgan börülce taze bakla lahanası"),
    meyve: L("elma armut portakal mandalina limon greyfurt muz çilek kiraz vişne erik kayısı şeftali nektarin üzüm karpuz kavun incir nar hurma ayva dut böğürtlen ahududu yaban mersini kivi ananas mango avokado papaya muşmula alıç zerdali kuşburnu hindistancevizi dragon"),
    tatli: L("baklava künefe sütlaç kazandibi aşure revani şekerpare lokum kadayıf tulumba helva dondurma kek pasta kurabiye çikolata bisküvi gofret şeker tiramisu cheesecake brownie profiterol muhallebi keşkül tatlı tatlısı ekmekkadayıfı lokma cezerye macun draje sakız jelibon bonibon kruvasan donut çörek"),
    icecek: L("su çay kahve süt ayran şalgam limonata gazoz kola meyvesuyu soda şerbet kefir salep boza sütlaç içecek meşrubat enerji maden"),
    hayvan: L("kedi köpek at eşek inek öküz boğa koyun keçi kuzu tavuk horoz hindi kaz ördek tavşan fare sıçan hamster kuş kartal şahin doğan baykuş güvercin serçe karga leylek turna bülbül papağan kanarya penguen flamingo balık köpekbalığı yunus balina fok mors ahtapot yengeç karides midye kaplumbağa kertenkele yılan timsah kurbağa aslan kaplan leopar çita jaguar puma kurt tilki çakal ayı panda zürafa fil gergedan zebra deve geyik ceylan antilop maymun goril şempanze orangutan kanguru koala yarasa sincap kirpi köstebek porsuk samur arı karınca kelebek sinek sivrisinek böcek örümcek akrep çekirge solucan salyangoz hamsi sardalya palamut levrek çipura lüfer uskumru somon alabalık ton katır manda sığır dana buzağı kuzu civciv hayvan martı pelikan tavus ibis sülün keklik ağaçkakan sakarmeke yavru"),
    meslek: L("doktor hekim öğretmen mühendis avukat hemşire polis asker pilot şoför aşçı garson berber kuaför terzi marangoz demirci kasap manav bakkal fırıncı çiftçi çoban balıkçı bahçıvan elektrikçi tesisatçı boyacı inşaatçı mimar muhasebeci bankacı sporcu futbolcu şarkıcı oyuncu yazar ressam müzisyen gazeteci fotoğrafçı veteriner eczacı dişçi cerrah psikolog diyetisyen teknisyen usta işçi memur müdür yönetmen tercüman rehber kaptan itfaiyeci postacı temizlikçi güvenlik bekçi hakim savcı noter imam papaz emekli öğrenci hanım akademisyen profesör doçent araştırmacı programcı yazılımcı tasarımcı girişimci esnaf tüccar satıcı kasiyer sekreter şoför kurye muhtar belediye başkan vekil sanatçı heykeltıraş şair komedyen sunucu spiker öğretim"),
    sehir: L("adana adıyaman afyonkarahisar afyon ağrı amasya ankara antalya artvin aydın balıkesir bilecik bingöl bitlis bolu burdur bursa çanakkale çankırı çorum denizli diyarbakır edirne elazığ erzincan erzurum eskişehir gaziantep antep giresun gümüşhane hakkari hatay ısparta mersin istanbul izmir kars kastamonu kayseri kırklareli kırşehir kocaeli izmit konya kütahya malatya manisa kahramanmaraş maraş mardin muğla muş nevşehir niğde ordu rize sakarya samsun siirt sinop sivas tekirdağ tokat trabzon tunceli şanlıurfa uşak van yozgat zonguldak aksaray bayburt karaman kırıkkale batman şırnak bartın ardahan ığdır yalova karabük kilis osmaniye düzce bodrum marmaris fethiye kaş alanya kemer side belek çeşme alaçatı kuşadası didim ayvalık cunda bozcaada gökçeada amasra safranbolu ürgüp göreme kapadokya pamukkale bakü gence şəki şeki lənkəran lenkeran nahçıvan sumqayıt sumgayıt mingeçevir şamahı kabala gusar tebriz berlin paris londra roma madrid moskova"),
    ulke: L("türkiye azerbaycan almanya fransa ingiltere italya ispanya portekiz hollanda belçika isviçre avusturya yunanistan bulgaristan romanya macaristan polonya çekya slovakya sırbistan hırvatistan bosna kosova arnavutluk makedonya karadağ slovenya ukrayna rusya belarus gürcistan ermenistan kazakistan özbekistan türkmenistan kırgızistan tacikistan iran irak suriye lübnan ürdün israil filistin suudi arabistan yemen umman katar kuveyt bahreyn mısır libya tunus cezayir fas sudan etiyopya somali kenya nijerya gana senegal güney afrika çin japonya kore hindistan pakistan afganistan bangladeş tayland vietnam endonezya malezya filipinler singapur avustralya yenizelanda kanada amerika abd meksika brezilya arjantin şili peru kolombiya venezuela küba isveç norveç finlandiya danimarka izlanda irlanda estonya letonya litvanya malta kıbrıs lüksemburg monako maldivler"),
    doga: L("dağ dağı göl gölü nehir ırmak deniz denizi ova orman şelale vadi plaj sahil kıyı yayla ada körfez boğaz kanyon mağara çöl bataklık erciyes uludağ palandöken kaçkar nemrut toros munzur süphan tendürek ağrı everest alp alpler himalaya fuji kilimanjaro eğirdir beyşehir iznik sapanca abant salda tuz fırat dicle kızılırmak yeşilırmak meriç seyhan ceyhan tuna ren volga nil amazon akdeniz ege marmara karadeniz hazar baykal niagara kızıldeniz"),
    mekan: L("ev evde iş işyeri okul park bahçe sokak cadde mahalle köy kasaba şehir otel hastane market çarşı pazar restoran lokanta kafe sinema tiyatro müze stadyum kütüphane havalimanı havaalanı otogar istasyon cami kilise banka postane fabrika ofis dükkan mağaza avm apartman bina kat oda salon mutfak banyo balkon yatakodası bahçe çatı garaj yol sahil üniversite kampüs yurt kışla karakol belediye çiftlik tarla yayla pansiyon kamp köşk site daire"),
    renk: L("kırmızı mavi yeşil sarı turuncu mor pembe siyah beyaz gri kahverengi lacivert turkuaz bordo bej altın gümüş eflatun lila krem haki fuşya mercan vişneçürüğü açık koyu"),
    mevsim: L("ilkbahar yaz sonbahar kış bahar güz"),
    tasit: L("araba otomobil otobüs minibüs dolmuş tren metro tramvay vapur gemi feribot tekne uçak helikopter bisiklet motosiklet motor scooter taksi kamyon tır traktör yürüyerek yaya servis metrobüs marmaray teleferik otomobil araç kayık yat balon paten kaykay sürücü kamyonet jip cip araba"),
    giyim: L("gömlek tişört pantolon etek elbise ceket mont kaban kazak hırka şapka bere atkı eldiven çorap ayakkabı bot terlik sandalet kemer kravat takım pijama don mayo şort şal eşarp tayt yelek palto gözlük ceket sweatshirt hoodie bluz tunik şalvar önlük kep"),
    mutfak: L("tencere tava kaşık çatal bıçak tabak bardak fincan kupa demlik çaydanlık cezve kavanoz tepsi süzgeç rende oklava kevgir kepçe maşa spatula fırın ocak buzdolabı bulaşık makinesi mikser blender tost makinesi kettle ısıtıcı lavabo musluk çöp kovası sürahi termos kase çaydanlık sofra mutfak örtü tabldot kesme tahtası açacak soğutucu derin dondurucu mutfaktaki"),
    ev_esya: L("koltuk kanepe sandalye masa yatak yastık yorgan battaniye çarşaf perde halı kilim dolap gardrop komodin ayna lamba abajur avize televizyon ütü çamaşır makinesi klima soba kalorifer vantilatör havlu sabun şampuan fırça süpürge paspas kova deterjan saksı kitaplık sehpa puf bank portmanto raf duvar kapı pencere merdiven halı yatak odası tv tablo vazo mum mumluk bornoz çarşaf nevresim"),
    teknoloji: L("telefon bilgisayar tablet laptop radyo kulaklık şarj powerbank kamera klavye mouse yazıcı oyun konsol playstation xbox saat akıllısaat drone hoparlör modem router flash disk usb sim kart"),
    kisisel: L("cüzdan anahtar kalem defter kitap gözlük çanta şemsiye para kart mendil krem parfüm ruj tarak makyaj ilaç şişe pasaport kimlik ajanda silgi kalemtıraş cetvel sırt çantası çakmak sigara diş fırçası macun deodorant selpak ıslak havlu maske"),
    uygulama: L("whatsapp instagram facebook twitter x tiktok youtube netflix spotify telegram snapchat google chrome safari gmail harita yandex trendyol hepsiburada getir yemeksepeti amazon linkedin pinterest discord zoom meet teams outlook mesaj arama kamera galeri not hesap makinesi saat takvim oyun"),
    akraba: L("anne baba abla abi ağabey kardeş dayı amca teyze hala yenge enişte kuzen dede nine babaanne anneanne torun oğul kız eş karı koca gelin damat kayınvalide kayınpeder baldız bacanak elti görümce kayınbirader aile akraba"),
    sayi: L("sıfır bir iki üç dört beş altı yedi sekiz dokuz on onbir oniki onüç ondört onbeş yirmi otuz kırk elli altmış yetmiş seksen doksan yüz bin yok hiç tek çift yarım"),
    zaman: L("sabah öğle öğleden akşam gece erken geç saat buçuk çeyrek dakika yarım gündüz şafak seher"),
    isim: L("ceylan karaca doğan mercan nar şeker bahar çağla kaya taş pınar ırmak alp elma limon susam aslı sevgi huzur umut mutlu bilge deniz gül nergis kiraz aslan arslan kaplan bulut ay güneş yıldız ada defne zeytin badem nehir toprak rüzgar doğa şafak tuna aras fırat dicle su ceren çağlar derya poyraz kuzey ekin ebru")
  };

  var GRUP = {
    yiyecek: ["yemek", "sebze", "meyve", "tatli"],
    yiyecek_icecek: ["yemek", "sebze", "meyve", "tatli", "icecek"],
    yer: ["sehir", "ulke", "doga", "mekan"],
    esya: ["ev_esya", "teknoloji", "kisisel", "giyim", "mutfak"],
    hediye: ["ev_esya", "teknoloji", "kisisel", "giyim", "mutfak", "tatli", "tasit"],
    canta: ["kisisel", "teknoloji", "giyim", "yemek", "sebze", "meyve", "tatli", "icecek"],
    mutfakta: ["mutfak", "yemek", "sebze", "meyve", "tatli", "icecek"],
    alis: ["ev_esya", "teknoloji", "kisisel", "giyim", "mutfak", "yemek", "sebze", "meyve", "tatli", "icecek", "tasit"],
    zaman: ["sayi", "zaman"],
    bahce: ["sebze", "meyve", "cicek", "bitki"],
    akraba: ["akraba", "isim"]
  };
  // AI kısa adları
  GRUP.esya_genel = GRUP.esya;

  var ETIKET = { yemek: "yemek", sebze: "sebze", meyve: "meyve", tatli: "tatlı", icecek: "içecek", hayvan: "hayvan",
    meslek: "meslek", sehir: "şehir", ulke: "ülke", doga: "doğa", mekan: "mekan", renk: "renk", mevsim: "mevsim",
    tasit: "taşıt", giyim: "giyim eşyası", mutfak: "mutfak eşyası", ev_esya: "ev eşyası", teknoloji: "teknoloji ürünü",
    kisisel: "kişisel eşya", cicek: "çiçek", bitki: "bitki", spor: "spor dalı", enstruman: "müzik aleti", uygulama: "uygulama", akraba: "akraba", sayi: "sayı", zaman: "zaman", isim: "isim" };

  var SORU = {
    "Adın ne?": "isim", "Annenin adı ne?": "isim", "Babanın adı ne?": "isim", "En iyi arkadaşının adı ne?": "isim",
    "Bir akrabanın adını söyle.": "akraba",
    "Nerelisin?": "yer", "Şu an neredesin?": "yer", "Doğduğun yer neresi?": "yer",
    "Hangi şehirde yaşamak istersin?": "yer", "Tatilde nereye gitmek istersin?": "yer", "Hangi ülkeyi görmek istersin?": "ulke",
    "Hangi dağı ya da gölü görmek istersin?": "doga",
    "Mesleğin ne?": "meslek", "Kaç kardeşin var?": "sayi",
    "En sevdiğin yemek ne?": "yiyecek", "En sevdiğin meyve ne?": "meyve", "En sevdiğin hayvan ne?": "hayvan",
    "En sevdiğin renk ne?": "renk", "En sevdiğin mevsim hangisi?": "mevsim",
    "Doğum günü hediyesi olarak ne istersin?": "hediye",
    "Kahvaltıda ne yedin?": "yiyecek_icecek", "Dün akşam ne yedin?": "yiyecek_icecek",
    "Akşam yemeğinde ne yemeyi seversin?": "yiyecek", "Çayın yanında ne yersin?": "yiyecek",
    "Çantanda ne var?": "canta", "Mutfakta ne var?": "mutfakta", "Evinde en çok kullandığın eşya ne?": "esya",
    "En son ne satın aldın?": "alis", "İşe ya da okula nasıl gidersin?": "tasit",
    "Sabah kaçta kalkarsın?": "zaman", "Gece kaçta uyursun?": "zaman",
    "Telefonunda en çok hangi uygulamayı kullanırsın?": "uygulama",
    "En sevdiğin içecek ne?": "icecek", "Bir çiçek adı söyle.": "cicek", "Hangi sporu seversin?": "spor",
    "En sevdiğin tatlı ne?": "tatli", "Bahçende ne yetiştirmek istersin?": "bahce", "Hangi aracı kullanmak istersin?": "tasit",
    "En sevdiğin şarkıcı kim?": "isim", "Hangi müzik aletini çalmak istersin?": "enstruman",
    "Sabah ilk ne yaparsın?": "serbest", "Hafta sonu ne yaparsın?": "serbest", "Boş zamanında ne yaparsın?": "serbest"
  };

  var EKLER = ("larından lerinden ından inden ların lerin ları leri ndan nden dan den tan ten lar ler nın nin nun nün yla yle ımız imiz umuz ümüz " +
    "cılık cilik cı ci cu cü çı çi çu çü lık lik luk lük lı li lu lü sı si su sü yı yi yu yü nı ni nu nü ın in un ün ım im um üm da de ta te ya ye na ne la le ı i u ü a e m n k").split(" ");

  var MAP = {}, SAYAC = {};
  function ekleKelimeler(kat, liste) {
    liste.forEach(function (w) {
      w = TUR(w).trim();
      if (!w) return;
      (MAP[w] = MAP[w] || []);
      if (MAP[w].indexOf(kat) < 0) { MAP[w].push(kat); SAYAC[kat] = (SAYAC[kat] || 0) + 1; }
    });
  }
  // Sınırsız (özel isim içeren) kategoriler: liste bu sayıya ulaşmadıysa bilinmeyen kelime "geçersiz" sayılmaz
  var MUAF = { hayvan: 1, meyve: 1, doga: 1, sehir: 1, ulke: 1, mevsim: 1, renk: 1 };
  var ACIK = { isim: 300, sehir: 400, doga: 200, uygulama: 150 };

  // ---- Sözlük ----
  var SOZLUK = {}, SOZLUK_N = 0, FIIL = {};
  var ATOM = ("lar ler larım lerim ların lerin ları leri ım im um üm ın in un ün sı si su sü ı i u ü yı yi yu yü nı ni nu nü a e ya ye na ne da de ta te dan den tan ten la le yla yle nın nin nun nün ki dır dir dur dür tır tir tur tür " +
    "lı li lu lü sız siz suz süz cı ci cu cü çı çi çu çü lık lik luk lük ca ce ça çe cık cik laş leş lan len lat let ıl il ul ül " +
    "ar er ır ir ur ür yor uyor ıyor iyor üyor dı di du dü tı ti tu tü mış miş muş müş acak ecek yacak yecek ayım eyim yım yim sın sin sun sün sınız siniz sunuz sünüz ız iz uz üz mak mek ma me mı mi mu mü ış iş uş üş arak erek ınca ince unca ünce ken sa se ydı ydi yan yen an en ıp ip up üp dık dik duk dük tık tik tuk tük dığ diğ duğ düğ tığ tiğ tuğ tüğ " +
    "y s n m r z ş").split(" ");
  var ZM = {};
  function zincir(s) {
    if (s === "") return true;
    if (s.length > 14) return false;
    if (ZM[s] !== undefined) return ZM[s];
    var r = false;
    for (var i = 0; i < ATOM.length && !r; i++) {
      var a = ATOM[i];
      if (s.length >= a.length && s.slice(0, a.length) === a && zincir(s.slice(a.length))) r = true;
    }
    return (ZM[s] = r);
  }
  function sozlukYukle(liste) {
    liste.forEach(function (w) {
      w = TUR(String(w)).trim();
      if (w.length < 2) return; // tek harfli kayıtlar sözlüğe alınmaz
      if (!SOZLUK[w]) { SOZLUK[w] = 1; SOZLUK_N++; }
      if (w.length > 4 && /(mak|mek)$/.test(w)) FIIL[w.slice(0, -3)] = 1;
    });
  }
  function kokVar(k) { return SOZLUK[k] || MAP[k] || FIIL[k]; }
  function sozlukGecerli(t) {
    if (!SOZLUK_N) return null;
    if (SOZLUK[t] || MAP[t]) return true;
    for (var i = t.length - 1; i >= 2; i--) {
      var kok = t.slice(0, i);
      if (i < 3 && !FIIL[kok]) continue;
      if (!zincir(t.slice(i))) continue;
      var v = [kok], son = kok.slice(-1), on = kok.slice(0, -1);
      if (son === "b") v.push(on + "p");
      if (son === "c") v.push(on + "ç");
      if (son === "d") v.push(on + "t");
      if (son === "ğ") { v.push(on + "k"); v.push(on + "g"); }
      if (v.some(kokVar)) return true;
    }
    return false;
  }
  Object.keys(VERI).forEach(function (k) { ekleKelimeler(k, VERI[k]); });
  // ---- GENİŞ LİSTELER ----
  var EK = {
  "mekan": "abdesthane ameliyathane balhane balıkhane baruthane basmahane batakhane bekarhane bendehane berhane besihane birahane bitirimhane boyahane bozahane bulaşıkhane buzhane böcekhane bıçkıhane cambazhane cephane darphane defterhane dershane devlethane dikimhane divanhane dokumahane doğumhane dökümhane fakirhane fatihane ferhane fetvahane fişekhane fotoğrafhane gazhane gusülhane güderihane gümüşhane haddehane hahamhane halvethane hapishane hayalhane haşhaşhane helvahane humbarahane ibadethane idarehane imalathane imarethane inekhane ipekhane iplikhane kademhane kahvehane kalavrahane kalayhane kalhane kasaphane kaynakhane kayıkhane kağıthane kerhane kesimhane keşişhane kiremithane kirişhane klişehane konsoloshane kuluçkahane kumarhane kumbarahane kuşhane kütüphane kılıçhane kıraathane mahpushane mantarhane mapushane marangozhane mehterhane memişhane mevlevihane meyhane misafirhane miskinhane muayenehane mumhane muslihane muvakkithane mücellithane mühendishane mürettiphane nakkarhane nekahethane nezarethane patrikhane peynirhane piskoposhane rasathane saadethane sabunhane salhane saraçhane sebilhane sefarethane sefihane semahane silahhane süthane sırmakeşhane tabakhane tahaffuzhane talimhane tamirhane tasfiyehane tavhane telgrafhane tembelhane teneffüshane tephirhane tercihane terkiphane terzihane tevkifhane teşrihhane ticarethane tophane tüfekhane tımarhane umumhane vaftizhane yatakhane yazıhane yağhane yemekhane yetimhane yoğurthane çalgıhane çamaşırhane çayhane çekiçhane çelikhane çiftehane çilehane ıslahhane şaphane şaraphane şifahane şişhane ev eve evde işyeri iş okul anaokulu kreş ilkokul ortaokul lise üniversite fakülte enstitü akademi kolej dershane etüt yurt pansiyon otel motel hostel kamp kampüs bungalov villa yazlık kışlık köşk konak saray kale kule kasr apartman bina blok site daire kat çatı bodrum garaj otopark asansör merdiven koridor hol salon oda mutfak banyo tuvalet balkon teras avlu bahçe veranda sundurma hastane klinik poliklinik eczane dispanser revir market süpermarket bakkal manav kasap şarküteri fırın pastane tatlıcı çiçekçi kuruyemişçi kuaför berber güzellik terzi kuyumcu optik çilingir tamirci lastikçi benzinlik akaryakıt çamaşırhane çarşı pazar bazar kapalıçarşı pasaj han hamam avm mağaza dükkan butik büfe kiosk restoran lokanta kafe kafeterya kahvehane çayhane yemekhane kantin pub bar disko gazino meyhane birahane pizzacı kebapçı köfteci balıkçı sinema tiyatro opera bale konser müze galeri sergi kütüphane kitabevi kırtasiye stadyum arena saha kort havuz plaj sahil kıyı iskele liman marina rıhtım tersane köprü tünel viyadük yol otoyol cadde sokak çıkmaz meydan kavşak havalimanı havaalanı otogar terminal istasyon peron metro durak cami mescit kilise sinagog manastır tapınak türbe tekke medrese banka atm postane ptt noter adliye mahkeme cezaevi hapishane karakol polis jandarma emniyet kışla belediye valilik kaymakamlık muhtarlık nüfus vergi sgk itfaiye fabrika atölye şantiye depo ambar antrepo ofis büro plaza rezidans santral baraj gölet tarla bağ bostan çiftlik ahır kümes ağıl samanlık değirmen mera yayla orman koru piknik mesire köy kasaba mahalle semt ilçe belde kent şehir metropol başkent mezarlık sauna spa kaplıca termal akvaryum lunapark sirk hayvanat sahne sera fidanlık laboratuvar gözlemevi planetaryum merkez anıt abide şadırvan çeşme sarnıç kervansaray bedesten sahaf arşiv tapu düğün kuaför bahçesi lokantası restoranı çatı katı",
  "ev_esya": "koltuk kanepe berjer sandalye tabure puf masa sehpa yatak karyola baza başlık yastık yorgan battaniye çarşaf nevresim pike örtü perde stor jaluzi tül halı kilim paspas yolluk dolap gardırop gardrop komodin şifonyer çekmece raf kitaplık vitrin büfe konsol dresuar ayna portmanto askı askılık şemsiyelik ayakkabılık lamba abajur avize aplik lambader mum şamdan vazo saksı çerçeve tablo saat televizyon tv klima kalorifer radyatör soba şömine termosifon şofben kombi vantilatör nemlendirici süpürge mop kova faraş fırça çamaşır kurutma ütü çamaşırlık mandal sepet bohça valiz bavul kutu sandık çöp sabunluk havlu bornoz lavabo klozet duş küvet batarya musluk şampuan sabun deterjan yumuşatıcı çamaşırsuyu bez sünger kapı pencere cam kepenk korkuluk merdiven duvar tavan zemin parke laminat fayans seramik mermer boya çekiç tornavida pense matkap testere çivi vida cıvata somun kablo priz fiş ampul sigorta şalter jeneratör pil uzatma beşik bebek mama oyuncak peluş ayıcık bebekarabası yastıklık minder şilte yatakörtüsü masaörtüsü paspas peçete çerçeveli halıfleks duvarkağıdı perdelik jüt hasır tabela eşya mobilya döşeme gardolap soyunma sehpalık çiçeklik kuşluk kafes akvaryum",
  "tatli": "baklava şöbiyet burma sarıburma nuriye dilber dudağı göbeği lokma tulumba şekerpare revani sütlaç kazandibi tavukgöğsü muhallebi keşkül aşure helva künefe kadayıf güllaç cheesecake tiramisu brownie cupcake muffin donut pankek waffle krep profiterol ekler kruvasan tart turta mille mozaik sufle supangle trileçe kremşanti krema puding jöle pelte komposto hoşaf cezerye lokum akide şeker bonbon draje karamel çikolata nutella kurabiye bisküvi petibör kraker kek pasta dondurma kaymaklı kayısı ezme marmelat reçel pekmez bal gofret lolipop sakız jelibon şekerleme macun tatlı tatlısı fındıklı bademli fıstıklı cevizli kaymaklı sütlü çikolatalı muzlu havuçlu limonlu elmalı ayvalı kabaklı incirli baklavası kadayıfı ekmek tahin irmik peynir tel şekeri pişmaniye çubuk cevizli sucuk lokumu fıstık ezmesi bamya tatlı tavuk göğsü şambali revanisi kemalpaşa ekmekkadayıfı hanımgöbeği dilberdudağı vezirparmağı kalburabastı saray lokması külah",
  "yemek": "tarhana ezogelin yayla düğün domatesli şehriye tavuksuyu işkembe paça kelle mercimek kebap şiş beyti iskender testi alinazik tandır kavurma saç tas orman cağ döner tantuni lahmacun pide etliekmek karnıyarık musakka imambayıldı dolma sarma yaprak türlü güveç hünkarbeğendi incik buğulama haşlama kızartma ızgara fırın tavuk piliç hindi bonfile antrikot pirzola biftek köfte inegöl akçaabat çiğköfte içli sulu izmir ekşili kadınbudu mücver pilav pilavı şehriyeli nohutlu makarna spagetti penne noodle erişte mantı ravioli lazanya pizza hamburger sandviç tost dürüm gözleme börek böreği sigara paçanga poğaça açma simit pişi hamur yufka mıhlama kuymak menemen omlet sahanda yumurta haşlanmış çılbır sucuk pastırma salam sosis jambon peynir lor çökelek tulum kaşar kaymak tereyağı zeytin hamsi palamut lüfer levrek çipura somon alabalık sardalya istavrit mezgit barbunya kalamar karides midye ahtapot salata çoban gavurdağı piyaz cacık haydari ezme acılı humus babagannuş muhammara turşu yoğurt cips kraker çerez fıstık fındık ceviz badem leblebi çekirdek kuruyemiş patlamış popcorn nugget kızartması hotdog wrap sushi ramen taco burrito paella risotto kahvaltı kahvaltılık kuru fasulye nohut mercimek bulgur bezelye pirinç patates püre köfteli kıymalı etli sebzeli zeytinyağlı enginar pırasa taze barbunyalı ıspanaklı kabak çiçek bamya bakla börülce semizotu yoğurtlu mantarlı peynirli kaşarlı sucuklu pastırmalı ekmek lavaş bazlama gevrek bagel simitçi tavuklu soslu salçalı turşusu konserve kavurma kebabı kuzu tandırı yaprak sarma kıymalı pide lahmacunu börekçi mantısı çorbası makarnası pilavı yemeği hazır pişmiş çiğ taze kuru",
  "sebze": "domates salatalık biber sivribiber dolmalık çarliston kapya patlıcan kabak balkabağı patates tatlıpatates soğan sarımsak havuç pırasa ıspanak marul roka maydanoz dereotu nane tere turp pancar kereviz karnabahar brokoli lahana bezelye fasulye börülce bakla bamya mısır enginar kuşkonmaz mantar semizotu ısırgan pazı zencefil yerelması turşu şalgam fesleğen kekik biberiye nane tarhun frenksoğanı",
  "meyve": "elma armut portakal mandalina limon greyfurt altıntop muz çilek kiraz vişne erik kayısı şeftali nektarin üzüm karpuz kavun incir nar hurma ayva dut böğürtlen ahududu yabanmersini kivi ananas mango avokado papaya muşmula alıç zerdali kuşburnu hindistancevizi dragon liçi guava goji frambuaz kızılcık turunç bergamot meyve",
  "icecek": "su maden soda gazoz kola fanta sprite pepsi meyvesuyu limonata çay bitkiçayı ıhlamur adaçayı papatya kahve türk filtre espresso latte cappuccino mocha nescafe süt kakao ayran şalgam boza salep sahlep şerbet kefir smoothie milkshake bira şarap rakı viski votka kokteyl enerji buzlu içecek meşrubat",
  "hayvan": "kedi köpek kuş papağan muhabbet kanarya hamster tavşan kobay kaplumbağa inek buzağı öküz boğa manda koyun kuzu koç keçi oğlak at tay kısrak eşek katır deve domuz tavuk horoz civciv hindi kaz ördek güvercin aslan kaplan leopar çita jaguar puma panter vaşak kurt çakal tilki ayı panda koala kanguru zebra zürafa fil gergedan hipopotam geyik ceylan antilop bizon karaca maymun goril şempanze orangutan babun lemur fare sıçan sincap kunduz porsuk kirpi köstebek yarasa kartal şahin doğan atmaca akbaba baykuş puhu leylek turna kuğu flamingo pelikan martı karga saksağan kumru serçe saka bülbül ispinoz sığırcık kırlangıç ardıç keklik bıldırcın sülün tavus devekuşu penguen ağaçkakan hüthüt guguk yılan kobra engerek timsah kertenkele bukalemun iguana kurbağa semender hamsi sardalya levrek çipura lüfer palamut uskumru istavrit alabalık somon ton vatoz yunus balina fok mors ahtapot kalamar yengeç ıstakoz karides midye istiridye denizyıldızı denizatı denizanası mercan arı karınca kelebek güve sinek sivrisinek böcek hamamböceği uğurböceği çekirge örümcek akrep kene pire bit solucan salyangoz sümüklüböcek yavru hayvan balık köpekbalığı yılanbalığı sazan turna yayın kefal mezgit kalkan dil pisi mürekkepbalığı tırtıl pas böceği tavşan ördekbalığı kaya antilobu su aygırı deniz aslanı kutup ayısı",
  "meslek": "doktor hekim cerrah uzman pratisyen dişçi ortodontist hemşire ebe hastabakıcı eczacı veteriner psikolog psikiyatr fizyoterapist diyetisyen laborant radyolog paramedik şoför kaptan pilot hostes stevard makinist tırcı kurye taksici dolmuşçu öğretmen öğretim hoca profesör doçent asistan okutman müdür müdire rektör dekan avukat hakim savcı noter polis komiser jandarma asker subay general albay yüzbaşı çavuş er itfaiyeci bekçi güvenlik mühendis mimar teknisyen tekniker usta kalfa çırak işçi mühendis elektrikçi tesisatçı boyacı sıvacı kalıpçı demirci kaynakçı tornacı marangoz doğramacı camcı cilacı döşemeci halıcı terzi biçki berber kuaför manikürcü estetisyen kuyumcu saatçi tamirci oto mekanik lastikçi bakkal manav kasap balıkçı fırıncı pastacı aşçı garson komi barmen tezgahtar kasiyer satıcı pazarcı esnaf tüccar sanayici girişimci bankacı muhasebeci mali müşavir sigortacı emlakçı memur sekreter yönetici müdür genel çiftçi çoban bahçıvan ormancı balıkçı avcı arıcı süt sütçü yazar şair gazeteci muhabir editör spiker sunucu yönetmen senarist oyuncu aktör aktris sanatçı ressam heykeltıraş fotoğrafçı grafiker tasarımcı müzisyen şarkıcı besteci piyanist gitarist davulcu orkestra dansçı koreograf sporcu futbolcu basketbolcu voleybolcu yüzücü atlet güreşçi boksör antrenör hakem programcı yazılımcı bilgisayar analist veri bilim doktora araştırmacı bilim fizikçi kimyager biyolog matematikçi astronom jeolog tarihçi arkeolog sosyolog filozof ilahiyatçı imam müezzin papaz rahip haham vaiz öğrenci emekli hanım işsiz stajyer gönüllü rehber tercüman çevirmen kütüphaneci arşivci postacı temizlikçi hizmetli bahçıvan kapıcı şoför bekçi nöbetçi",
  "giyim": "gömlek tişört pantolon etek elbise ceket mont kaban kazak hırka şapka bere atkı eldiven çorap ayakkabı bot terlik sandalet kemer kravat takım pijama don mayo şort şal eşarp tayt yelek palto gözlük bluz tunik şalvar önlük kep sweatshirt hoodie polar yağmurluk kaşkol bandana başörtüsü türban tesettür abiye gelinlik damatlık smokin fular papyon kol düğmesi manşet cep yaka düğme fermuar cüzdan kemerli spor eşofman tayt külot sütyen atlet fanila boxer kısa uzun gecelik sabahlık bornoz kostüm tulum salopet etek pantalon kabanı çizme galoş stiletto topuklu babet loafer mokasen krampon sneaker converse",
  "mutfak": "tencere tava kaşık çatal bıçak tabak bardak fincan kupa demlik çaydanlık cezve kavanoz tepsi süzgeç rende oklava kevgir kepçe maşa spatula fırın ocak buzdolabı bulaşık makinesi mikser blender tost kettle ısıtıcı lavabo musluk kova sürahi termos kase sofra örtü kesme tahtası açacak soğutucu dondurucu düdüklü tencere güveç saklama kabı çaydanlığı çaydanlıklar çay bardağı çay tabağı kahve fincanı şekerlik tuzluk biberlik yağdanlık sosluk meyvelik ekmeklik tabaklık bardaklık kaşıklık çatallık bıçaklık aspiratör davlumbaz tezgah evye çöp kovası paspas sünger deterjan bulaşık eldiven önlük mutfak havlusu peçete tabldot sandviç kızartma makinesi airfryer kahve makinesi çay makinesi ekmek kızartma doğrayıcı rondo robot mutfak tartı terazi ölçü kabı kalıp kek kalıbı fırın tepsisi mantı kalıbı dilimleyici soyucu zımba tırnak",
  "kisisel": "cüzdan anahtar kalem defter kitap gözlük çanta şemsiye para kart mendil krem parfüm ruj tarak makyaj ilaç şişe pasaport kimlik ajanda silgi kalemtıraş cetvel çakmak sigara diş fırçası macun deodorant selpak ıslak havlu maske kulaklık şarj powerbank telefon saat bilezik yüzük kolye küpe broş toka lastik raptiye ataş zımba bant makas yapıştırıcı dosya klasör kartlık cüzdanlık kimlik kartı kredi kartı ehliyet ruhsat bilet pul zarf mektup not defteri bloknot kağıt kalemlik boya pastel kurşun dolma kalem tükenmez fosforlu pilot matara termos sandviç su şişesi ilaç kutusu vitamin pastil sakız şeker çikolata bisküvi atıştırmalık mısır peçete dezenfektan kolonya lens lens kabı gözlük kabı ayna taraklık rimel allık fondöten oje far kapatıcı",
  "teknoloji": "telefon bilgisayar tablet laptop radyo kulaklık şarj powerbank kamera klavye mouse yazıcı konsol playstation xbox saat akıllısaat drone hoparlör modem router flash disk usb sim kart ekran monitör televizyon projektör kumanda joystick gamepad mikrofon webcam tarayıcı hafıza kartı harddisk ssd işlemci ram anakart ekran kartı fan soğutucu laptop çantası navigasyon gps kamera drone akıllı telefon iphone android samsung xiaomi huawei apple airpods powerbank adaptör priz çoklu fiş uzatma kablo hdmi bluetooth wifi",
  "tasit": "araba otomobil otobüs minibüs dolmuş tren metro tramvay vapur gemi feribot tekne uçak helikopter bisiklet motosiklet motor scooter taksi kamyon tır traktör yürüyerek yaya servis metrobüs marmaray teleferik araç kayık yat balon paten kaykay kamyonet jip cip otomatik manuel elektrikli hibrit tramvay füniküler raylı sistem hızlı tren yht banliyö otobüsü şehirlerarası ambulans itfaiye aracı çekici vinç iş makinesi ekskavatör greyder silindir bisikleti dağ bisikleti yarış bisikleti tandem rickshaw tuk tuk gondol kano kürek sandal jet ski deniz motoru denizaltı roket uzay mekik uzay gemisi tren vagon lokomotif otobüs durağı",
  "uygulama": "whatsapp instagram facebook twitter x tiktok youtube netflix spotify telegram snapchat google chrome safari gmail harita yandex trendyol hepsiburada getir yemeksepeti amazon linkedin pinterest discord zoom meet teams outlook mesaj arama kamera galeri not hesap makinesi saat takvim oyun twitch reddit tumblr threads bluebird signal viber skype messenger drive dropbox onedrive icloud wallet banka mobil bankacılık papara tosla ininal paycell cüzdan uber bitaksi martı scooter booking airbnb tripadvisor skyscanner enuygun obilet biletall passo biletix mobiletix tv gain exxen blutv disney prime hbo muud fizy deezer shazam soundcloud podcast kitap kindle storytel okuma duolingo babbel udemy coursera khan eba mebi okul e-okul e-devlet turkcell vodafone türk telekom bip hava durumu pusula fener ses kaydedici hesap haritalar apple google play store appstore minecraft roblox pubg freefire brawl clash candy crush subway surfers temple run pokemon go among us wordle kelime oyunu",
  "akraba": "anne baba abla abi ağabey kardeş dayı amca teyze hala yenge enişte kuzen dede nine babaanne anneanne torun oğul kız eş karı koca gelin damat kayınvalide kayınpeder baldız bacanak elti görümce kayınbirader aile akraba hısım komşu yeğen yeğeni üvey anası babası ablası ağabeyi kardeşi dayısı amcası teyzesi halası yengesi eniştesi kuzeni dedesi ninesi torunu oğlu kızı eşi karısı kocası geliniz damadı abisi anneannesi babaannesi büyük küçük öz süt manevi vaftiz kirve sağdıç nikah tanık akrabası bacı kız kardeş erkek kardeş ikiz",
  "renk": "kırmızı mavi yeşil sarı turuncu mor pembe siyah beyaz gri kahverengi lacivert turkuaz bordo bej altın gümüş eflatun lila krem haki fuşya mercan vişneçürüğü açık koyu portakal limon kiremit vişne çilek bal kahve çimen deniz gökyüzü petrol zümrüt yakut safir fildişi antrasit füme camgöbeği yağ yeşili çağla mint nane sarımsı kırmızımsı mavimsi yeşilimsi pembemsi morumsu mor menekşe lavanta gül kurusu pudra şeftali kayısı hardal safran zeytin yeşili bataklık ördek başı mavisi çivit indigo ultramarin cyan magenta bakır bronz kızıl şarap kan kızı alev ateş kömür gece",
  "doga": "dağ dağı göl gölü nehir ırmak deniz denizi ova orman şelale vadi plaj sahil kıyı yayla ada körfez boğaz kanyon mağara çöl bataklık tepe yamaç zirve doruk kayalık uçurum kıyı koy burun yarımada kumsal dere çay pınar kaynak şelale göl havzası delta nehir ağzı akarsu buzul volkan krater yanardağ vaha step bozkır tundra tayga savan yağmur ormanı sulak alan milli park tabiat park koru orman gölet baraj şelalesi kanyonu mağarası",
  "sayi": "sıfır bir iki üç dört beş altı yedi sekiz dokuz on onbir oniki onüç ondört onbeş onaltı onyedi onsekiz ondokuz yirmi otuz kırk elli altmış yetmiş seksen doksan yüz iki yüz üç yüz bin milyon yok hiç tek çift yarım çeyrek tane adet kişi ikiz üçüz dörtlü bir iki üç",
  "zaman": "sabah öğle öğleden akşam gece erken geç saat buçuk çeyrek dakika yarım gündüz şafak seher sabahleyin akşamüstü ikindi gece yarısı yarısı öğlen sabaha doğru bugün yarın dün şimdi hemen sonra önce hafta ay yıl gün hafta sonu pazartesi salı çarşamba perşembe cuma cumartesi pazar ocak şubat mart nisan mayıs haziran temmuz ağustos eylül ekim kasım aralık",
  "mevsim": "ilkbahar yaz sonbahar kış bahar güz mevsim",
  "isim": "bahar ceylan nar şeker kaya taş pınar mercan karaca doğan şahin kartal aslan kaplan arslan yıldırım poyraz bulut kiraz gül nergis elma çağla ela su ay güneş yıldız deniz derya irmak nehir ada defne zeytin badem toprak rüzgar doğa tuna aras fırat dicle ceren kuzey can ekin ebru eylül ekim alp doruk zirve su nil nilüfer papatya menekşe lale sümbül zambak yasemin leylak karanfil begonya orkide lavanta mimoza gelincik ayçiçeği çiğdem kardelen ceylan karaca ahu bilge bülbül kumru güvercin serçe sevgi umut mutlu şirin neşe huzur barış özgür yağız kurt yiğit bora fırtına simge deniz derin engin dalga damla"
};
  Object.keys(EK).forEach(function (k) { ekleKelimeler(k, L(EK[k])); });
  var EK2 = {
  "cicek": "gül lale karanfil papatya sümbül nergis zambak menekşe orkide yasemin leylak ortanca begonya kasımpatı kardelen çiğdem gelincik nilüfer ayçiçeği mimoza şebboy aslanağzı petunya sardunya fulya manolya kamelya lavanta çuha kadife hanımeli gardenya akasya çiçek şakayık frezya glayör gerbera anemon zerrin sedef yıldızçiçeği güllü karanfilli lotus",
  "bitki": "ağaç çam meşe kavak çınar ardıç selvi ceviz kayın dişbudak akçaağaç sedir köknar servi zeytin incir dut kestane fındık badem söğüt huş okaliptüs palmiye bambu kaktüs sukulent eğrelti ot çimen yosun mantar kekik nane biberiye adaçayı fesleğen maydanoz ıhlamur defne sarmaşık orman fide fidan tohum yonca buğday arpa çavdar yulaf pirinç mısır pamuk tütün çay kahve şeker",
  "spor": "futbol basketbol voleybol hentbol tenis masatenisi badminton yüzme atletizm koşu jimnastik güreş boks judo karate taekwondo eskrim okçuluk atıcılık binicilik bisiklet kayak snowboard hokey paten yelken kürek sörf dalış tırmanış yoga pilates fitness halter golf beyzbol ragbi kriket bilardo dart satranç briç tavla dama paraşüt kano rafting yürüyüş trekking kampçılık cimnastik sutopu plaj voleybolu masa tenisi",
  "enstruman": "gitar piyano keman viyola çello kontrbas flüt klarnet obua fagot saksafon trompet trombon korno tuba arp org akordeon davul darbuka def bendir zil bağlama saz cura divan ud kanun ney kaval zurna mey tambur kemençe rebap santur cümbüş mızıka ukulele banjo bas elektrogitar synthesizer keyboard harmonika mandolin tef kudüm"
};
  Object.keys(EK2).forEach(function (k) { ekleKelimeler(k, L(EK2[k])); });
  // ---- /GENİŞ LİSTELER ----

  // ---- Genişletilmiş listeler (genel sözlük taraması + ek kelimeler) ----
  var EK = {
    mekan: L("ada adacık adliye ahır akademi akvaryum alt ambar ameliyathane anaokulu anıt apartman ara arena arşiv asansör atölye avlu avm bahçe bahçesi bakkal bakkaliye bakımevi balkon balıkçı banka banyo bar baraj barınağı bazar bağ bekleme belde belediye berber bina birahane bisiklet blok bodrum botanik bulvar bungalov burun butik bölge büfe büro cadde cami cezaevi daire dalgakıran depo dernek dershane değirmen dondurmacı doğumhane durak duraklar dönerci dükkan eczane enstitü etüt ev evde eve fabrika fakülte fener feribot fuar fırın galeri garaj gazino geçit gözlemevi gümrük hamam hapishane hastane havaalanı havalimanı havuz hayvanat hol hostel huzurevi il ilkokul ilçe iskele istasyon iş işyeri jandarma kafe kafeterya kahvehane kaldırım kale kamp kampüs kantin kapalıçarşı kaplıca kapı karakol kasaba kasap kat kavşak kaymakamlık kebapçı kilise kiosk kitabevi klinik konak konser konservatuvar koridor koru koy kreş kuaför kule kulüp kuruyemişçi köprü körfez köy köşe köşk kümes kütüphane kıraathane kırtasiye kıta kışla laboratuvar lavabo liman lise lobi lokanta lunapark mahalle mahkeme manastır manav marina market mağaza medrese mera merdiven mescit mesire metro meydan meyhane mezarlık mezra motel muayenehane muhtarlık mutfak müze nahiye noter oda ofis okul okyanus opera organize orman ortaokul otel otoban otogar otopark otoyol oyun pansiyon park parkı parti pastane pastaneci pazar peron pideci piknik pizzacı plaj planetaryum plaza poliklinik postane ptt pub rasathane resepsiyon restoran rezidans rıhtım sahil sahne salon salonu samanlık sanayi santral saray sauna sağlıkevi sağlıkocağı sendika sera serbest sergi sinagog sinema site sitesi sokak sokağı spa spor stadyum stüdyo sınır tarla tatlıcı tekke teras termal terminal tersane terzi tiyatro tramvay tuvalet tünel türbe vakıf valilik vapur villa viyadük yarımada yatakodası yaya yayla yazlık yemekhane yol yolu yurt çarşı çatı çayhane çayocağı çiftlik çiğköfteci çocukparkı üniversite üst şantiye şehir"),
    ev_esya: L("abajur ampul aplik askı askılık aspiratör avize ayakkabılık ayna aynalık bank batarya battaniye bavul baza başlık berjer bezi beşik biblo bornoz buzdolabı büfe cam davlumbaz deterjan diş dolabı dolap dondurucu duş duşjeli faraş fayans fener fiş fırça fırın gardrop halı halıfleks havlu havluluk hoparlör jaluzi kalorifer kanepe kanepesi kapı karyola kilim kilit kitaplık klima klozet koltuk koltuğu komodin konsol kova kurutma kutu küvet kırlent lamba lambader laminat lavabo leğen macun mandal masa masası merdiven mikrodalga minder mum musluk nemlendirici nevresim ocak oturma parke paspas pencere perde perdelik pike pil portmanto priz puf radyatör radyo raf ranza saat sabun sabunluk saksı sandalye sandalyesi sandık seccade sedir sehpa sepet seramik soba stor sünger süpürge tablo tabure takvim tarak televizyon termosifon teyp toz tv tül tüp valiz vantilatör vazo vitrin yastık yastığı yatak yatakodası yatağı yemek yorgan yorganı yumuşatıcı zil çamaşır çamaşırlık çamaşırsuyu çarşaf çerçeve çiçeklik çöp ünite ütü şamdan şampuan şifonyer şilte şişe şofben şömine"),
    tatli: L("akide ay ayva açma aşure baklava baklavası bal bisküvi bonbon brownie burma bülbül cevizli cezerye cheesecake cupcake dilber dilimi dolama dolması dondurma donut draje dudağı ekler ekmek elma ezmesi feuille fiyöz fırın fıstık fıstıklı gofret gülaç güllaç hanımgöbeği havuç haşhaşlı helva helvası incir irmik jelibon kabak kadayıf kadayıfı kalburabastı kandil kaymak kayısı kazandibi kek kemalpaşa keşkül krema kremalı kremşanti krep kruvasan kurabiye kuru köftesi köme külah künefe lokma lokması lokum lokumu lolipop macun marmelat mercimek meyve meyveli mil mille mozaik muffin muhallebi nar nuriye nutella pankek parmağı pasta pekmez pestil peynir poğaça profiterol puding revani reçel sakız salatası saray sarma sarığıburma simidi simit sorbe supangle sütlaç sütlü tahin taneleri tart tartolet tatlı tatlısı tavukgöğsü tiramisu trileçe tulumba un vezir vişne waffle yaş yuvası zerde çikolata çikolatalı çörek çöreği şambali şeker şerbetli şöbiyet"),
    yemek: L("adana ahtapot alabalık antrikot ayran açma aşure bal balık bamya barbunya bazlama beyaz beyti bezelye biber biftek bonfile bulgur but börek böreği cacık ciğer dolma dolması domates düğün ekmek ekşili enginar erişte et etli ezogelin falafel fasulye guveç gözleme güveç hamburger hamsi haydari haşlanmış humus hünkarbeğendi imambayıldı iskender ispanaklı izgara izmir içli işkembe jambon kabak kadınbudu kalamar kanat karides karnıyarık karışık kavurma kayganası kaymak kaşar kaşarlı kebabı kelle kereviz kokoreç kol kremalı kuru kuyruk kuzu kuşbaşılı köfte kıymalı kızartma kızartması lahana lahmacun lavaş lazanya levrek lor lüfer makarna mantar mantı menemen mercimek mevsim midye musakka mücver nohut nohutlu nugget omlet orman palamut pastırma patates patlıcan paça pekmez peynir peynirli pide pilav piliç pirzola pizza poğaça püre pırasa reçel risotto sac sahanda saksı salam salata salatası sandviç sarma sarması sebze sigara simit somon sosis spagetti su sucuk sucuklu sulu suyu tahin tandır tantuni tarhana tas tava tavuk taze tereyağı testi tost tulum turşu türlü urfa uskumru yahni yaprak yayla yağı yemeği yoğurt yufka yumurta yumurtalı yuvalama zeytin zeytinyağlı çipura çiğ çiğköfte çoban çorbası çöp ıspanak ızgara şehriye şiş şnitzel"),
    sebze: L("acur asma bakla bamya beyazlahana bezelye biber brokoli börülce dereotu dolmalık domates enginar fasulye havuç hindiba kabak kapya karnabahar kereviz kornişon kuşkonmaz kırmızıbiber kırmızılahana labada lahana lahanası mantar marul maydanoz mısır nane pancar patates patlıcan pazı pırasa radika roka salatalık sarımsak semizotu sivri soğan tere turp turşu yaprağı yerelması yeşilbiber çarliston çiçeği ıspanak şalgam"),
    meyve: L("ahududu alıç ananas armut avokado ayva bergamot böğürtlen dragon dut dünya elma erik frambuaz greyfurt guava hindistancevizi hurma hurması incir karpuz kavun kayısı kiraz kivi kumkuat kuşburnu kuşüzümü kızılcık limon liçi mandalina mango mersini muz muşmula nar nektarin papaya portakal trabzon turunç vişne yaban yabanmersini yeni zerdali çağla çilek üzüm şeftali"),
    icecek: L("adaçayı ayran bira bitkiçayı boza buzlu cappuccino enerji espresso filtre gazoz içecek kahve kakao kefir kokteyl kola kuşburnu latte limon limonata limonlu maden meyvesuyu meşrubat milkshake mocha nane nescafe papatya rakı salep siyahçay smoothie soda soğuk su süt sütlü sıcak türkkahvesi viski votka yeşilçay çay çikolata ıhlamur şalgam şarap şerbet"),
    hayvan: L("ahtapot akbaba akrep alabalık alakarga alpaka anakonda antilop arı arıkuşu arısı aslan at atmaca ayı ağaçkakan bal balina balık balıkçıl barbunya baykuş bit bizon boğa bukalemun buzağı böcek böceği bülbül bıldırcın ceylan civciv dana denizanası denizatı denizyıldızı deve domuz doğan ejderha engerek eşek eşekarısı fare fil flamingo fok gergedan geyik goril guguk güvercin hamamböceği hamsi hamster hindi horoz ibis iguana inek ispinoz istavrit jaguar kalamar kanarya kanguru kaplan kaplumbağa karabatak karaca karasinek karga karides kartal karınca katır kaya kaz kedi kedibalığı kefal keklik kelebek kene kertenkele keçi kirpi koala kobra koyun kumru kunduz kurbağa kurt kuyruksallayan kuzu kuğu kuş köpek köpekbalığı köstebek kılıçbalığı kırlangıç lama lemur leopar levrek leylek lokum lüfer manda manta martı maymun mercan midye mors mürekkepbalığı narval orangutan orfoz orka orkinos palamut panda papağan pelikan penguen pire piton porsuk puma saksağan salyangoz samur sansar sardalya sazan semender serçe sincap sinek sivrisinek sloth solucan somon sülün sıçan sığır tavuk tavus tavşan tekir tembelhayvan tilki timsah ton turna tırtıl uskumru uğurböceği vatoz vaşak yaban yak yarasa yengeç yunus yılan yılanbalığı zargana zebra zürafa çakal çaylak çekirge çinekop çipura çita çıngıraklıyılan öküz ördek örümcek ıstakoz şahin şempanze"),
    meslek: L("akademisyen anestezi animatör antropolog araştırmacı arkeolog arıcı asker astronom avcı avukat aşçı aşçıbaşı bagajcı bahçıvan bakkal bale balıkçı bankacı başkan bekçi belediye berber biletçi biyolog boyacı bulaşıkçı cerrah coğrafyacı dansçı danışman demirci denetçi denizci din diyetisyen dişçi doktor doçent ebe eczacı editör elektrikçi emekli emlakçı emniyet esnaf filozof fizikçi fizyoterapist fotoğrafçı futbolcu fırıncı gardiyan garson gazeteci girişimci grafiker görevlisi güvenlik hafız hahambaşı hakim hamal hanım harita hekim hemşire heykeltıraş hostes hâkim icra ilahiyatçı illüstratör imam inşaatçı itfaiyeci işçi jeolog kahveci kameraman kaptan kapıcı kasap kasiyer katip kimyager komedyen komi komiser komisyoncu kontrolör koreograf kuaför kurye madenci maganda makinist makyöz mali manav manken marangoz matematikçi memur meteorolog mimar modacı muhabir muhasebeci muhasip muhtar müdür müezzin müfettiş müftü mühendis müzisyen müşavir noter ormancı oyuncu papaz pastacı pazarlamacı perde petrolcü pilot polis polisi postacı profesör programcı psikolog radyolog rahip redaktör rehber reklamcı ressam reyon sahne sanatçı satıcı satış savcı sekreter sigortacı simitçi sondajcı sosyolog spiker sporcu steward stilist stüdyocu sunucu tapu tarihçi tasarımcı tatlıcı tayfa teknisyen temizlikçi tercüman terzi tesisatçı tezgahtar tiyatrocu tüccar usta vaiz vatman vekil veteriner yargıç yayıncı yazar yazılımcı yönetici yönetmen çaycı çevirmen çiftçi çizer çoban öğrenci öğretim öğretmen ışıkçı şair şarkıcı şef şekerci şoför"),
    giyim: L("atkı atlet ayakkabı babet bandana bağcık bere bluz bone bot ceket don elbise eldiven etek eşarp fanila fötr gecelik gömlek gözlük hoodie hırka jean kaban kapüşon kasket kazak kemer kep kollu kot kravat külot kısa mayo melon mokasen mont palto pantolon pijama polo postal sandalet spor sweatshirt sütyen takım tayt terlik tişört topuklu trençkot tulum tunik uzun yağmurluk yelek çizme çorap önlük şal şalvar şapka şemsiye şort"),
    mutfak: L("airfryer ankastre açacak açacağı bardak bardağı biberlik bileyici blender bulaşık buzdolabı bıçak cezve demlik dondurucu doğrayıcı düdüklü ekmek ekmeklik elek fincan fincanı fritöz fırın güveç havan kahve kase kasesi kavanoz kaşık kaşıklık kaşığı kepçe kesme kettle kevgir konserve kovası kupa kıyma lavabo limon makas makinesi mantar maşa mikser musluk mutfak mutfaktaki ocak oklava peçetelik portakal presi rende rendesi robotu saksı salata servis seti sirkelik sofra soyacak soğutucu spatula su sürahi sürahisi süzgeç sıkacak sıkacağı tabak tabağı tahtası takımı tatlı tava tencere tepsi termos tost tuzluk waffle yağdanlık yemek çatal çay çaydanlık çelik çorba çöp çırpıcı örtü üstü ısıtıcı ısıtıcısı şekerlik şişe"),
    teknoloji: L("adaptör akıllısaat aleti anakart bilgisayar bluetooth cihazı disk drone dronu e-kitap ekran el fan feneri flash flaş fotoğraf gamepad gopro gps hafıza hdmi hesap hoparlör işlemci joystick kablo kamera kart kartı kasa kayıt kindle klavye konsol kulaklık kulaklığı kumanda laptop lazer lens makinesi mikrofon modem monitör mouse oyun pager playstation pointer powerbank projeksiyon radyo ram router saat sabit ses sim soğutucu ssd tablet talkie tarayıcı telefon televizyon telsiz tripod ups usb walkie webcam xbox yazıcı şarj"),
    kisisel: L("ajanda anahtar anahtarlık ataç atkı aynası bandana banknot bant beslenme bilet bilezik bisküvi broş cetvel cüzdan cımbız defter defteri deodorant dezenfektan diş ehliyet fırçası gözlük günlük havlu ilaç jel kabı kalem kalemtıraş kart kartı kağıt kimlik kitap kol kolonya kolye kredi krem kulaklık kutusu küpe kılıfı macun madeni makası makyaj maske matara mendil not para parfüm pasaport ped peçete ruhsat ruj saat saati selpak sigara silgi su sırt tarak telefon termos toka tırnak yapıştırıcı yemek yüzük zımba çakmak çanta çantası ıslak şemsiye şişe şişesi"),
    tasit: L("ambulans araba arabası aracı araç at atlı balon banliyö beton bisiklet cenaze cip deniz deniztaksi dolmuş dozer engelli eşek fayton feribot füniküler gemi gemisi gondol greyder hanta helikopter hızlı hızlıtren itfaiye iş jet jip kamyon kamyonet kaykay kayık kepçe kızak lokomotif makinesi marmaray metro metrobüs mikseri minibüs motor motorbot motosiklet otobüs otobüsü otomobil paraşüt paten planör polis roket sal sandal sandalye scooter servis silindir sürücü taksi tanker tekerlekli tekne teleferik traktör tramvay tren tır uzay uzaygemisi uçak vagon vapur vinç yat yaya yürüyerek çekici şehirhatları")
  };
  Object.keys(EK).forEach(function (k) { ekleKelimeler(k, EK[k]); });

  function adaylar(w) {
    var out = [w], seen = {}; seen[w] = 1;
    (function rec(x, d) {
      if (d >= 2) return;
      EKLER.forEach(function (ek) {
        if (x.length - ek.length >= (ek.length === 1 ? 4 : 3) && x.slice(-ek.length) === ek) {
          var s = x.slice(0, -ek.length);
          if (!seen[s]) { seen[s] = 1; out.push(s); rec(s, d + 1); }
        }
      });
    })(w, 0);
    return out;
  }

  function tokenla(c) {
    return TUR(c).split(/[\s,;.!?]+/).map(function (t) { return t.split(/['’]/)[0]; }).filter(Boolean);
  }

  function coz(spec) {
    var a = Array.isArray(spec) ? spec : String(spec).split(",");
    var out = [];
    a.forEach(function (x) {
      x = x.trim();
      (GRUP[x] || [x]).forEach(function (y) { if (out.indexOf(y) < 0) out.push(y); });
    });
    return out;
  }

  function kontrol(soru, cevap, kategori) {
    var spec = kategori || SORU[soru];
    var serbest = !spec || spec === "serbest";
    var kabul = serbest ? [] : coz(spec);
    var tokens = tokenla(cevap), suphe = null;
    var isimSorusu = kabul.indexOf("isim") >= 0;

    // 1) Sözlük kontrolü (her cevapta): anlamsız kelimeyi reddet
    if (SOZLUK_N) {
      var bakilan = serbest ? ["isim", "sehir"] : kabul;
      var tolerans = bakilan.some(function (k) { return ACIK[k] && (SAYAC[k] || 0) < ACIK[k]; });
      for (var a = 0; a < tokens.length; a++) {
        if (sozlukGecerli(tokens[a]) === false) {
          if (!tolerans) return { durum: "gecersiz", kelime: tokens[a] };
          suphe = tokens[a]; // özel isim olabilir: kesin karar verilemez
        }
      }
    }
    if (serbest) return suphe ? { durum: "bilinmiyor", kelime: suphe } : { durum: "serbest" };

    // 2) Kategori kontrolü (her cevapta)
    var yanlis = null;
    for (var i = 0; i < tokens.length; i++) {
      var cs = adaylar(tokens[i]);
      for (var j = 0; j < cs.length; j++) {
        var kats = MAP[cs[j]];
        if (!kats) continue;
        if (kats.some(function (k) { return kabul.indexOf(k) >= 0; })) return { durum: "uygun" };
        var yk = isimSorusu ? kats.filter(function (k) { return !MUAF[k]; }) : kats;
        if (!yk.length) continue; // isim olarak da kullanılabilen kelime (Ceylan, Kiraz, Doğan...)
        if (!yanlis) yanlis = { kelime: tokens[i], kategori: yk[0], etiket: ETIKET[yk[0]] || yk[0] };
      }
    }
    if (yanlis) { yanlis.durum = "uyumsuz"; return yanlis; }
    return { durum: "bilinmiyor" };
  }

  var API = {
    kontrol: kontrol,
    ekle: function (kat, liste) { ekleKelimeler(kat, liste); },
    sayac: function () { return SAYAC; },
    sozlukYukle: sozlukYukle,
    sozlukGecerli: sozlukGecerli,
    soruKategorisi: function (soru) { return SORU[soru] || null; }
  };
  g.HarfKategori = API;
  if (typeof module !== "undefined" && module.exports) module.exports = API;
})(typeof window !== "undefined" ? window : globalThis);
