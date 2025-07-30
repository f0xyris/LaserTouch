import nodemailer from 'nodemailer';

// Email configuration
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
};

// Create transporter
const transporter = nodemailer.createTransporter(emailConfig);

// Email templates
const emailTemplates = {
  appointmentSubmitted: {
    subject: {
      ua: 'Ваша заявка на запис прийнята',
      en: 'Your appointment request has been submitted',
      ru: 'Ваша заявка на запись принята',
      pl: 'Twoja prośba o wizytę została złożona'
    },
    body: {
      ua: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8b5cf6;">Ваша заявка на запис прийнята</h2>
          <p>Доброго дня!</p>
          <p>Дякуємо за запис на прийом. Ваша заявка успішно подана і знаходиться на розгляді модератора.</p>
          <p><strong>Деталі запису:</strong></p>
          <ul>
            <li>Послуга: {serviceName}</li>
            <li>Дата: {appointmentDate}</li>
            <li>Час: {appointmentTime}</li>
            <li>Статус: Очікує підтвердження</li>
          </ul>
          <p>Ми повідомимо вас електронною поштою, коли модератор підтвердить ваш запис.</p>
          <p>З найкращими побажаннями,<br>Команда LaserTouch</p>
        </div>
      `,
      en: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8b5cf6;">Your appointment request has been submitted</h2>
          <p>Hello!</p>
          <p>Thank you for booking an appointment. Your request has been successfully submitted and is under moderator review.</p>
          <p><strong>Appointment details:</strong></p>
          <ul>
            <li>Service: {serviceName}</li>
            <li>Date: {appointmentDate}</li>
            <li>Time: {appointmentTime}</li>
            <li>Status: Pending confirmation</li>
          </ul>
          <p>We will notify you by email when the moderator confirms your appointment.</p>
          <p>Best regards,<br>LaserTouch Team</p>
        </div>
      `,
      ru: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8b5cf6;">Ваша заявка на запись принята</h2>
          <p>Добрый день!</p>
          <p>Спасибо за запись на прием. Ваша заявка успешно подана и находится на рассмотрении модератора.</p>
          <p><strong>Детали записи:</strong></p>
          <ul>
            <li>Услуга: {serviceName}</li>
            <li>Дата: {appointmentDate}</li>
            <li>Время: {appointmentTime}</li>
            <li>Статус: Ожидает подтверждения</li>
          </ul>
          <p>Мы уведомим вас по электронной почте, когда модератор подтвердит вашу запись.</p>
          <p>С наилучшими пожеланиями,<br>Команда LaserTouch</p>
        </div>
      `,
      pl: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8b5cf6;">Twoja prośba o wizytę została złożona</h2>
          <p>Dzień dobry!</p>
          <p>Dziękujemy za umówienie wizyty. Twoja prośba została pomyślnie złożona i jest w trakcie przeglądu przez moderatora.</p>
          <p><strong>Szczegóły wizyty:</strong></p>
          <ul>
            <li>Usługa: {serviceName}</li>
            <li>Data: {appointmentDate}</li>
            <li>Godzina: {appointmentTime}</li>
            <li>Status: Oczekuje potwierdzenia</li>
          </ul>
          <p>Powiadomimy Cię e-mailem, gdy moderator potwierdzi Twoją wizytę.</p>
          <p>Z poważaniem,<br>Zespół LaserTouch</p>
        </div>
      `
    }
  },
  appointmentConfirmed: {
    subject: {
      ua: 'Ваш запис підтверджено',
      en: 'Your appointment has been confirmed',
      ru: 'Ваша запись подтверждена',
      pl: 'Twoja wizyta została potwierdzona'
    },
    body: {
      ua: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Ваш запис підтверджено</h2>
          <p>Доброго дня!</p>
          <p>Раді повідомити, що ваш запис на прийом підтверджено модератором.</p>
          <p><strong>Деталі запису:</strong></p>
          <ul>
            <li>Послуга: {serviceName}</li>
            <li>Дата: {appointmentDate}</li>
            <li>Час: {appointmentTime}</li>
            <li>Статус: Підтверджено</li>
          </ul>
          <p>Будь ласка, приходьте за 10 хвилин до призначеного часу.</p>
          <p>З найкращими побажаннями,<br>Команда LaserTouch</p>
        </div>
      `,
      en: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Your appointment has been confirmed</h2>
          <p>Hello!</p>
          <p>We are pleased to inform you that your appointment has been confirmed by the moderator.</p>
          <p><strong>Appointment details:</strong></p>
          <ul>
            <li>Service: {serviceName}</li>
            <li>Date: {appointmentDate}</li>
            <li>Time: {appointmentTime}</li>
            <li>Status: Confirmed</li>
          </ul>
          <p>Please arrive 10 minutes before the scheduled time.</p>
          <p>Best regards,<br>LaserTouch Team</p>
        </div>
      `,
      ru: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Ваша запись подтверждена</h2>
          <p>Добрый день!</p>
          <p>Рады сообщить, что ваша запись на прием подтверждена модератором.</p>
          <p><strong>Детали записи:</strong></p>
          <ul>
            <li>Услуга: {serviceName}</li>
            <li>Дата: {appointmentDate}</li>
            <li>Время: {appointmentTime}</li>
            <li>Статус: Подтверждено</li>
          </ul>
          <p>Пожалуйста, приходите за 10 минут до назначенного времени.</p>
          <p>С наилучшими пожеланиями,<br>Команда LaserTouch</p>
        </div>
      `,
      pl: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Twoja wizyta została potwierdzona</h2>
          <p>Dzień dobry!</p>
          <p>Miło nam poinformować, że Twoja wizyta została potwierdzona przez moderatora.</p>
          <p><strong>Szczegóły wizyty:</strong></p>
          <ul>
            <li>Usługa: {serviceName}</li>
            <li>Data: {appointmentDate}</li>
            <li>Godzina: {appointmentTime}</li>
            <li>Status: Potwierdzona</li>
          </ul>
          <p>Prosimy przyjść 10 minut przed umówionym czasem.</p>
          <p>Z poważaniem,<br>Zespół LaserTouch</p>
        </div>
      `
    }
  },
  coursePurchased: {
    subject: {
      ua: 'Курс успішно придбано',
      en: 'Course successfully purchased',
      ru: 'Курс успешно приобретен',
      pl: 'Kurs został pomyślnie zakupiony'
    },
    body: {
      ua: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b;">Курс успішно придбано</h2>
          <p>Доброго дня!</p>
          <p>Дякуємо за покупку курсу навчання. Ваш платіж успішно оброблено.</p>
          <p><strong>Деталі курсу:</strong></p>
          <ul>
            <li>Назва курсу: {courseName}</li>
            <li>Тривалість: {courseDuration}</li>
            <li>Вартість: {coursePrice}</li>
          </ul>
          <p>Наші інструктори зв\'яжуться з вами найближчим часом для узгодження деталей навчання.</p>
          <p>З найкращими побажаннями,<br>Команда LaserTouch</p>
        </div>
      `,
      en: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b;">Course successfully purchased</h2>
          <p>Hello!</p>
          <p>Thank you for purchasing the training course. Your payment has been successfully processed.</p>
          <p><strong>Course details:</strong></p>
          <ul>
            <li>Course name: {courseName}</li>
            <li>Duration: {courseDuration}</li>
            <li>Price: {coursePrice}</li>
          </ul>
          <p>Our instructors will contact you soon to coordinate the training details.</p>
          <p>Best regards,<br>LaserTouch Team</p>
        </div>
      `,
      ru: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b;">Курс успешно приобретен</h2>
          <p>Добрый день!</p>
          <p>Спасибо за покупку курса обучения. Ваш платеж успешно обработан.</p>
          <p><strong>Детали курса:</strong></p>
          <ul>
            <li>Название курса: {courseName}</li>
            <li>Продолжительность: {courseDuration}</li>
            <li>Стоимость: {coursePrice}</li>
          </ul>
          <p>Наши инструкторы свяжутся с вами в ближайшее время для согласования деталей обучения.</p>
          <p>С наилучшими пожеланиями,<br>Команда LaserTouch</p>
        </div>
      `,
      pl: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b;">Kurs został pomyślnie zakupiony</h2>
          <p>Dzień dobry!</p>
          <p>Dziękujemy za zakup kursu szkoleniowego. Twoja płatność została pomyślnie przetworzona.</p>
          <p><strong>Szczegóły kursu:</strong></p>
          <ul>
            <li>Nazwa kursu: {courseName}</li>
            <li>Czas trwania: {courseDuration}</li>
            <li>Cena: {coursePrice}</li>
          </ul>
          <p>Nasi instruktorzy skontaktują się z Tobą wkrótce, aby uzgodnić szczegóły szkolenia.</p>
          <p>Z poważaniem,<br>Zespół LaserTouch</p>
        </div>
      `
    }
  }
};

// Helper function to format date
function formatDate(date: Date, language: string = 'ua'): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  const locales = {
    ua: 'uk-UA',
    en: 'en-US',
    ru: 'ru-RU',
    pl: 'pl-PL'
  };
  
  return date.toLocaleDateString(locales[language as keyof typeof locales] || 'uk-UA', options);
}

// Helper function to format time
function formatTime(date: Date, language: string = 'ua'): string {
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit'
  };
  
  const locales = {
    ua: 'uk-UA',
    en: 'en-US',
    ru: 'ru-RU',
    pl: 'pl-PL'
  };
  
  return date.toLocaleTimeString(locales[language as keyof typeof locales] || 'uk-UA', options);
}

// Main email sending function
async function sendEmail(to: string, template: keyof typeof emailTemplates, data: any, language: string = 'ua') {
  try {
    const emailTemplate = emailTemplates[template];
    const subject = emailTemplate.subject[language as keyof typeof emailTemplate.subject] || emailTemplate.subject.ua;
    
    let body = emailTemplate.body[language as keyof typeof emailTemplate.body] || emailTemplate.body.ua;
    
    // Replace placeholders with actual data
    Object.keys(data).forEach(key => {
      const placeholder = `{${key}}`;
      body = body.replace(new RegExp(placeholder, 'g'), data[key]);
    });
    
    const mailOptions = {
      from: process.env.SMTP_USER || 'noreply@lasertouch.com',
      to: to,
      subject: subject,
      html: body
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// Specific email functions
export async function sendAppointmentSubmittedEmail(
  userEmail: string, 
  serviceName: string, 
  appointmentDate: Date, 
  language: string = 'ua'
) {
  const data = {
    serviceName: serviceName,
    appointmentDate: formatDate(appointmentDate, language),
    appointmentTime: formatTime(appointmentDate, language)
  };
  
  return sendEmail(userEmail, 'appointmentSubmitted', data, language);
}

export async function sendAppointmentConfirmedEmail(
  userEmail: string, 
  serviceName: string, 
  appointmentDate: Date, 
  language: string = 'ua'
) {
  const data = {
    serviceName: serviceName,
    appointmentDate: formatDate(appointmentDate, language),
    appointmentTime: formatTime(appointmentDate, language)
  };
  
  return sendEmail(userEmail, 'appointmentConfirmed', data, language);
}

export async function sendCoursePurchasedEmail(
  userEmail: string, 
  courseName: string, 
  courseDuration: string, 
  coursePrice: string, 
  language: string = 'ua'
) {
  const data = {
    courseName: courseName,
    courseDuration: courseDuration,
    coursePrice: coursePrice
  };
  
  return sendEmail(userEmail, 'coursePurchased', data, language);
}

// Test email configuration
export async function testEmailConfiguration() {
  try {
    await transporter.verify();
    console.log('Email configuration is valid');
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
} 