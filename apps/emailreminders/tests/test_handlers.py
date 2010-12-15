import datetime
from apps.main.tests.base import BaseHTTPTestCase, TestClient

class LoginError(Exception):
    pass


class EmailRemindersTestCase(BaseHTTPTestCase):
    
    def setUp(self):
        super(EmailRemindersTestCase, self).setUp()
        self.client = TestClient(self)#self.get_app())
    
    def test_setting_up_reminders(self):
        db = self.get_db()
        url = '/emailreminders/'
        response = self.client.get(url)
        self.assertEqual(response.code, 200)
        
        # go straight into setting up an email reminder
        peter = db.User()
        peter.email = u'peter@test.com'
        peter.set_password('secret')
        peter.save()
        self.client.login('peter@test.com', 'secret')
        
        from apps.emailreminders.models import EmailReminder
        data = dict(weekdays=[EmailReminder.MONDAY, 
                              EmailReminder.WEDNESDAY],
                    time_hour=13,
                    time_minute=str(0),
                    tz_offset='-3',
                    )
        response = self.client.post(url, data)
        self.assertEqual(response.code, 302)
        
        email_reminder = db.EmailReminder.one()
        self.assertEqual(email_reminder.user._id, peter._id)
        self.assertEqual(email_reminder.weekdays, [EmailReminder.MONDAY, 
                                                   EmailReminder.WEDNESDAY])
        self.assertEqual(email_reminder.time, [13,0])
        self.assertEqual(email_reminder.tz_offset, -3)
        
        edit_url = "?edit=%s" % email_reminder._id
        
        # reload the page again and expect to see something about this reminder
        # in there
        response = self.client.get(url)
        self.assertEqual(response.code, 200)
        self.assertTrue(edit_url in response.body)
        
    def test_posting_email_in(self):
        url = '/emailreminders/receive/'
        body = ['From: bob@builder.com']
        body += ['To: reminder@donecal.com']
        body += ['Subject: [DoneCal] what did you do today?']
        body += ['']
        body += ['This is a test on @tagg']
        body += ['> INSTRUCTIONS:']
        body += ['> BLa bla bla']
        
        response = self.post(url, '\r\n'.join(body))
        self.assertTrue('Not recognized from user' in response.body)
        # because there is no user called bob@builder.com it would send an 
        # error reply
        import utils.send_mail as mail
        sent_email = mail.outbox[0]
        self.assertTrue(sent_email.to, ['bob@builder.com'])
        self.assertEqual(sent_email.subject, body[2].replace('Subject:', 'Re:'))
        from settings import EMAIL_REMINDER_SENDER
        self.assertTrue(sent_email.from_email, EMAIL_REMINDER_SENDER)
        self.assertTrue('> This is a test on @tagg' in sent_email.body)
        self.assertTrue('Not a registered account: bob@builder.com' in sent_email.body)
        
        # try again, this time with bob set up
        db = self.get_db()
        bob = db.User()
        bob.email = u'Bob@Builder.com'
        bob.first_name = u"Bob"
        bob.save()
        
        # try again, but this time it will fail because this user doesn't have any 
        # email reminders set up
        response = self.post(url, '\r\n'.join(body))
        self.assertTrue('No email reminders set up' in response.body)
        
        sent_email = mail.outbox[1]
        self.assertTrue("You don't have any email reminders set up" in sent_email.body)
        
        # set one up!
        email_reminder = db.EmailReminder()
        email_reminder.user = bob
        today = datetime.date.today()
        email_reminder.weekdays = [unicode(today.strftime('%A'))]
        email_reminder.time = (11,30)
        email_reminder.tz_offset = 0.0
        email_reminder.save()
        
        # Try again, now it should work
        response = self.post(url, '\r\n'.join(body))
        print response.body
        assert 0
        
        