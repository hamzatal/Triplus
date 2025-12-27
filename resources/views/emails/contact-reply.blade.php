<!DOCTYPE html>
<html>
<head>
    <title>رد من ترافل نست</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #16a34a; color: white; padding: 10px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 5px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #777; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>ترافل نست</h1>
        </div>
        <div class="content">
            <h2>رد على استفسارك</h2>
            <p>عزيزي/عزيزتي {{ $contact->name }}،</p>
            <p>شكرًا لتواصلك معنا. فيما يلي ردنا على استفسارك:</p>
            <p>{{ $message }}</p>
            <p>نقدر اهتمامك بترافل نست. لا تتردد في التواصل معنا مرة أخرى إذا كان لديك أي أسئلة.</p>
            <p>مع أطيب التحيات،<br>فريق ترافل نست</p>
        </div>
        <div class="footer">
            <p>© {{ date('Y') }} ترافل نست. جميع الحقوق محفوظة.</p>
        </div>
    </div>
</body>
</html>