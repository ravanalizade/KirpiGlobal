# KirpiGlobal landing səhifəsini kodla qur

Bu qovluqda KirpiGlobal-ın bir səhifəlik saytının hazır dizaynı var. KirpiGlobal xaricdə təhsil üzrə konsultasiya şirkətidir. Dizaynı real, işləyən sayta çevir. Dizaynı yenidən icad etmə: rəngləri, şriftləri, boşluqları və mətnləri olduğu kimi saxla.

## Qovluqda nə var

- `design/desktop.png`: 1440 px enində bütün səhifə.
- `design/phone.png`: 390 px enində bütün səhifə.
- `design/flows.png`: paket seçiləndə açılan forma, göndərəndən sonrakı ekran və kirpinin hərəkət sxemi.
- `design/source/*.dc.html`: dizayn faylları. Dəqiq hex rənglər, px ölçülər, boşluqlar və Azərbaycan dilindəki bütün mətnlər buradadır. Bu fayllar dizayn alətinin formatındadır: `support.js`, `<x-dc>`, `<helmet>`, `data-props` və `class Component extends DCLogic` hissələrini kopyalama, yalnız dəyərləri götür.
  - `Main.dc.html`: kompüter görünüşü
  - `Phone.dc.html`: telefon görünüşü
  - `Consult.dc.html`: paket seçiləndə açılan forma
  - `Done.dc.html`: göndərəndən sonrakı ekran
  - `Motion.dc.html`: kirpinin hərəkət sxemi
- `logo/*.svg`: hazır loqo, tünd fon versiyası, ikon. Loqonu yenidən çəkmə, bu faylları işlət. Favicon üçün `kirpiglobal-icon.svg`.

## Səhifənin tək məqsədi

Ziyarətçi pulsuz konsultasiyaya yazılsın. Hesab, giriş, qeydiyyat və fayl yükləmə yoxdur. Qiymət heç yerdə göstərilmir.

Bölmələr, yuxarıdan aşağı:

1. **Başlıq və giriş.** Loqo, "Pulsuz konsultasiya" düyməsi, böyük başlıq, bir cümlə izah, "Pulsuz konsultasiyaya qoşul" düyməsi. Düymələr səhifəni konsultasiya bölməsinə sürüşdürür.
2. **Pulsuz araşdırma.** Tünd yaşıl bölmə. Forma: "Universitet və ya ölkə" və "Mobil nömrə". Düymə: "Araşdırın və mənə zəng edin".
3. **Paketlər.** Üç sətir: Seçim, Müraciət, Tam yol. Hər sətirdə "Bu paketlə başla" düyməsi.
4. **Konsultasiya.** Nanə rəngli bölmə. Forma: "Ad və soyad" və "Mobil nömrə". Düymə: "Pulsuz konsultasiyaya qoşul".
5. **Footer.** Tünd loqo, telefon, il.

## Formalar

İki forma var, hər ikisi eyni yerə göndərilir, amma növü fərqlənir:

- **Araşdırma:** `type: "research"`, universitet/ölkə, nömrə.
- **Konsultasiya:** `type: "consultation"`, ad və soyad, nömrə, seçilmiş paket (seçilməyibsə boş).

Paket düyməsi `Consult.dc.html`-dəki formanı açır. Formanın yuxarısında "Seçdiyiniz paket: Müraciət" kimi sətir görünür. Telefonda bu forma tam ekran açılır, kompüterdə ortada dialoq kimi. Dialoq düzgün işləsin: fokus içəridə qalsın, Esc bağlasın, bağlananda fokus düyməyə qayıtsın.

Uğurlu göndərişdən sonra formanın yerində `Done.dc.html`-dəki təsdiq məzmunu görünür.

Nömrə yoxlaması: `+994 50 123 45 67`, `050 123 45 67`, `501234567` kimi yazılışları qəbul et və `+994501234567` formatına çevir. Xəta mesajları Azərbaycan dilində və konkret olsun, məsələn "Nömrə 9 rəqəmdən ibarət olmalıdır, məsələn 50 123 45 67". Göndəriş zamanı düyməni kilidlə ki, iki dəfə getməsin. Spama qarşı gizli honeypot sahəsi əlavə et.

### Data hara gedir: Google Sheets

Bütün müraciətlər bizim Google Sheets cədvəlimizə yeni sətir kimi yazılır. Server, verilənlər bazası və ödənişli xidmət yoxdur.

- `apps-script/Code.gs` faylını yaz: Google Apps Script `doPost` funksiyası. Gələn datanı yoxlayıb cədvələ bir sətir əlavə edir.
- Cədvəlin sütunları: Tarix (Bakı vaxtı), Növ (Araşdırma / Konsultasiya), Ad və soyad, Mobil nömrə, Universitet və ya ölkə, Paket, Status. Status sütunu boş qalır, onu komanda özü doldurur (məsələn, "Zəng edildi").
- Saytda Apps Script URL-i bir yerdə sabit kimi saxlansın: `[FORM_URL]`.
- Göndərişi `fetch` ilə `Content-Type: text/plain` olaraq et ki, brauzer CORS səbəbindən bloklamasın.
- Script tərəfində boş sahələri, honeypot doldurulmuş sorğuları və çox uzun mətnləri rədd et.
- Göndəriş alınmazsa, istifadəçiyə aydın mesaj göstər: "Göndərmək alınmadı. İnternet bağlantınızı yoxlayıb yenidən cəhd edin." Yazdıqları sahələrdən silinməsin.
- `apps-script/QURAŞDIRMA.md` faylı yaz: Google Sheets yaratmaqdan Apps Script-i "Web app" kimi yayımlamağa və URL-i sayta qoymağa qədər Azərbaycan dilində addım-addım təlimat. Kod bilməyən adam əməl edə bilsin.

Hər iki formanın düyməsinin altına razılıq mətni üçün yer saxla: `[RAZILIQ MƏTNİ: hüquqşünasdan gələcək]`. Fərdi məlumatlar qanununa görə bu mətn lazımdır.

## Canlı detal: kirpi istifadəçi ilə yol gedir

Sxem `design/flows.png`-in aşağı hissəsində və `Motion.dc.html`-dədir.

- **Kompüterdə:** ekranın sağ kənarında şaquli nöqtəli cığır var. Kirpi bu cığır boyunca hərəkət edir və vəziyyəti səhifənin scroll faizinə bağlıdır.
- **İstiqamət:** aşağı sürüşdürəndə kirpi aşağıya baxır. Yuxarı qayıdanda üzünü çevirir (horizontal flip), geri gedir.
- **Addım:** hərəkət edərkən ayaqları yüngülcə növbə ilə qalxıb-enir. Scroll dayananda kirpi də dayanır.
- **Sonda:** konsultasiya bölməsinə çatanda kirpi formanın üstündəki yerinə keçir və məzun papağı yuxarıdan başına düşür. Papaq bir dəfə düşür, yuxarı qayıdanda papaq çıxır.
- **Telefonda:** yan cığır yoxdur. Kirpi ekranın aşağısındakı üfüqi nöqtəli xətdə soldan sağa gedir, kiçik ölçüdə, mətnin üstünə düşmür.
- `prefers-reduced-motion` açıqdırsa, animasiya yoxdur: kirpi dizayndakı statik yerlərində durur.
- Animasiyanı `requestAnimationFrame` və `transform` ilə et, layout-u titrətməsin. Scroll hadisəsində ağır iş görmə.

Bu səhifədə başqa animasiya olmasın.

## Texniki tələblər

- Sadə saxla: HTML, CSS və az vanilla JavaScript. Framework lazım deyil. Form göndərişi üçün seçdiyimiz variant əlavə nə tələb etsə, onu ayrıca yaz.
- Şriftlər: başlıqlar **Geologica** (500, 600, 700), mətn **Onest** (400, 500, 600). Hər ikisi Azərbaycan hərflərini (ə, ğ, ı, ş, ç, ö, ü) dəstəkləyir. Self-host et, `font-display: swap`.
- Rəngləri CSS dəyişənləri kimi bir yerdə topla. Əsaslar: şam yaşılı `#0E5A4E`, tünd şam `#0A3B34`, nanə `#BFE3D6`, kəhrəba `#F4A52A`, mürəkkəb `#12211F`, boz-yaşıl `#4C5F5B`, duman `#F4F7F5`, xətt `#D5E0DC`. Qalanını dizayn fayllarından götür.
- Responsive: 360 px-dən 1920 px-ə qədər səliqəli görünsün, heç vaxt üfüqi scroll olmasın.
- Əlçatanlıq: hər inputun `<label>`-i olsun, klaviatura fokusu görünsün, mətn kontrastı ən azı 4.5:1, toxunma hədəfləri ən azı 44 px.
- `lang="az"`, düzgün `<title>`, meta description, Open Graph şəkli.
- Lighthouse: Performance, Accessibility, Best Practices və SEO 90-dan yuxarı.

## Bunları etmə

Dizaynda bunlar bilərəkdən yoxdur, sən də əlavə etmə:

- Bənövşəyi-göy qradiyent, qradiyentli başlıq mətni, qradiyent üstündə dən effekti.
- Emoji, Lucide və ya oxşar ikon dəstləri.
- Inter, Space Grotesk, Instrument Serif, kursiv serif vurğular.
- Rəngli haşiyəli kartlar, şüşə effekti (glassmorphism), üç ikon qutusu yan-yana.
- Başlığın üstündə nişan (badge).
- Hazır shadcn/ui komponentləri.
- Scroll ilə görünən fade-in bloklar, kursoru izləyən effektlər.
- Hover-də solub-itən düymələr (hover yalnız rəngi bir az tündləşdirsin).
- Tünd rejim.
- Uzun tire (—), boş marketinq sözləri. Mətnləri dizayndan dəyişmədən götür.

## Boş yerlər

Bunları kodda olduğu kimi saxla, mən dolduracağam: `[TELEFON]`, `[RAZILIQ MƏTNİ: hüquqşünasdan gələcək]`, `[FORM_URL]`.

## İşi bitirəndə

1. Saytı lokal işə sal.
2. 390 px və 1440 px enində screenshot çək və `design/phone.png`, `design/desktop.png` ilə yan-yana müqayisə et. Fərqləri düzəlt.
3. Hər iki formanı, paket dialoqunu və kirpinin bütün hallarını (aşağı, yuxarı, papaq, reduced-motion) yoxla.
4. Mənə qısa yaz: saytı necə işə salmaq, Google Sheets-i necə qoşmaq, nə qalıb.
