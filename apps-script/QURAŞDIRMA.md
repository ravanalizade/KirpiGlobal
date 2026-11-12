# Saytı Google Sheets cədvəlinə qoşmaq

Bu təlimatdan sonra saytdakı hər müraciət sizin Google Sheets cədvəlinizə yeni sətir kimi düşəcək. Kod bilmək lazım deyil. Təxminən 10 dəqiqə çəkir və pulsuzdur.

Lazım olan: bir Google hesabı (şirkətin ümumi hesabı olsa yaxşıdır, çünki cədvəl həmin hesabda qalacaq).

## 1. Cədvəl yaradın

1. Brauzerdə [sheets.google.com](https://sheets.google.com) açın və Google hesabınıza daxil olun.
2. **Blank spreadsheet** (boş cədvəl) düyməsini basın.
3. Yuxarı solda "Untitled spreadsheet" yazısına basıb ad verin, məsələn: `KirpiGlobal müraciətlər`.

Sütunları əl ilə yazmayın. Onları kod özü yaradacaq.

## 2. Kodu cədvələ əlavə edin

1. Cədvəlin yuxarı menyusunda **Extensions > Apps Script** seçin. Yeni səhifə açılacaq.
2. Açılan səhifədə `function myFunction() { ... }` yazılmış mətn görəcəksiniz. Hamısını seçib silin (Ctrl+A, sonra Delete).
3. Bu qovluqdakı `Code.gs` faylını Notepad ilə açın, bütün mətni kopyalayın (Ctrl+A, Ctrl+C) və boş sahəyə yapışdırın (Ctrl+V).
4. Yuxarıdakı disket ikonuna basın və ya Ctrl+S ilə yadda saxlayın.

## 3. Kodu bir dəfə işə salın və icazə verin

1. Yuxarıdakı sətirdə funksiya siyahısı var (orada `doPost` yazıla bilər). Ona basıb **setup** seçin.
2. **Run** düyməsini basın.
3. "Authorization required" pəncərəsi çıxacaq. **Review permissions** basın və hesabınızı seçin.
4. "Google hasn't verified this app" yazısı çıxsa, narahat olmayın: bu sizin öz kodunuzdur. **Advanced** basın, sonra **Go to ... (unsafe)** və **Allow**.
5. Cədvələ qayıdın. Aşağıda `Müraciətlər` adlı yeni vərəq və bu sütunlar görünməlidir:

   `Tarix | Növ | Ad və soyad | Mobil nömrə | Universitet və ya ölkə | Paket | Status`

## 4. Kodu "Web app" kimi yayımlayın

1. Apps Script səhifəsində yuxarı sağda **Deploy > New deployment** basın.
2. "Select type" yanındakı dişli çarx ikonuna basın və **Web app** seçin.
3. Sahələri belə doldurun:
   - **Description:** `KirpiGlobal forma`
   - **Execute as:** `Me` (öz hesabınız)
   - **Who has access:** `Anyone`
4. **Deploy** basın.
5. **Web app URL** altında uzun bir ünvan görünəcək. O, `https://script.google.com/macros/s/` ilə başlayır və `/exec` ilə bitir. **Copy** basıb kopyalayın.

"Who has access: Anyone" o deməkdir ki, sayt cədvələ sətir əlavə edə bilir. Cədvəlin özünü kənar adamlar görə bilmir.

## 5. Ünvanı yoxlayın

Kopyaladığınız ünvanı brauzerin yeni vərəqində açın. Belə bir cavab görməlisiniz:

```
{"ok":true,"message":"KirpiGlobal forması işləyir"}
```

Görürsünüzsə, hər şey qaydasındadır.

## 6. Ünvanı sayta qoyun

1. `site/main.js` faylını Notepad ilə açın.
2. Yuxarıda bu sətri tapın:

   ```js
   var FORM_URL = '[FORM_URL]';
   ```

3. `[FORM_URL]` yerinə kopyaladığınız ünvanı yapışdırın. Dırnaq işarələri qalmalıdır:

   ```js
   var FORM_URL = 'https://script.google.com/macros/s/AKfy.../exec';
   ```

4. Faylı yadda saxlayın və saytı yenidən yükləyin (hostinqə göndərin).

## 7. Sınaq göndərişi

1. Saytı açın, formalardan birini doldurun (öz nömrənizi yazın) və düyməni basın.
2. "Sorğunuzu aldıq" yazısı çıxmalıdır.
3. Cədvələ baxın: bir neçə saniyəyə yeni sətir görünəcək. Sınaq sətrini sonra silə bilərsiniz.

## Cədvəllə gündəlik iş

- **Tarix** sütunu Bakı vaxtı ilədir.
- **Növ** sütununda `Araşdırma` və ya `Konsultasiya` yazılır.
- **Paket** sütunu yalnız ziyarətçi paket seçibsə dolur.
- **Status** sütunu həmişə boş gəlir. Onu komanda özü doldurur, məsələn: `Zəng edildi`, `Cavab vermədi`, `Müqavilə`.
- Sütunların yerini dəyişməyin və aralarına yeni sütun əlavə etməyin. Qeydlər üçün yeni sütunu `Status`-dan sağda əlavə edin.
- `Müraciətlər` vərəqinin adını dəyişməyin. Dəyişsəniz, kod eyni adla yeni vərəq yaradıb ora yazacaq.

## Nəsə işləmirsə

**Saytda "Göndərmək alınmadı" yazılır.**
- `site/main.js` faylında ünvanın düzgün yapışdırıldığını, `/exec` ilə bitdiyini və dırnaqların yerində olduğunu yoxlayın.
- 5-ci addımı təkrar edin. Cavab əvəzinə Google-a giriş səhifəsi açılırsa, 4-cü addımda "Who has access" `Anyone` seçilməyib. **Deploy > Manage deployments**, qələm ikonu, `Anyone` seçin, **Deploy**.

**"Sorğunuzu aldıq" çıxır, amma cədvəldə sətir yoxdur.**
- Aşağıdakı vərəqlərdən `Müraciətlər` vərəqinə baxdığınızdan əmin olun.
- Apps Script səhifəsində solda **Executions** bölməsini açın. Orada hər göndəriş və xətası görünür.

**Kodu (`Code.gs`) sonradan dəyişmisiniz.**
Dəyişiklik özü-özünə yayımlanmır. **Deploy > Manage deployments**, qələm ikonu, "Version" siyahısında **New version**, sonra **Deploy**. Belə etsəniz ünvan dəyişmir və saytda heç nəyi yeniləmək lazım gəlmir. "New deployment" seçsəniz ünvan dəyişəcək və 6-cı addımı təkrar etməli olacaqsınız.

## Limitlər

Apps Script pulsuzdur və Google-un gündəlik istifadə limitləri bu ölçüdə sayt üçün kifayət qədər genişdir. Eyni anda 30-a qədər göndəriş qəbul edir. Dəqiq rəqəmlər: [developers.google.com/apps-script/guides/services/quotas](https://developers.google.com/apps-script/guides/services/quotas).
