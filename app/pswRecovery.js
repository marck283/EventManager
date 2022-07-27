const elastic = require('@elasticemail/elasticemail-client');
const express = require('express');
const router = express.Router();

router.post('', async (req, res) => {
    let defaultClient = elastic.ApiClient.instance;

    let apikey = defaultClient.authentications['apikey'];
    apikey.apiKey = process.env.EMAIL_API_KEY;

    let api = new elastic.EmailsApi();

    let email = elastic.EmailMessageData.constructFromObject({
        Recipients: [
            new elastic.EmailRecipient(req.body.email)
        ],
        Content: {
            Body: [
                elastic.BodyPart.constructFromObject({
                    ContentType: "HTML",
                    Content: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">\
                    <html xmlns="http://www.w3.org/1999/xhtml" lang="EN">\
                      <head>\
                        <style type="text/css">\
                          @media screen {\
                            @font-face {\
                              font-family: "Lato";\
                              font-style: normal;\
                              font-weight: 400;\
                              src: local("Lato Regular"), local("Lato-Regular"), url(https://fonts.gstatic.com/s/lato/v11/qIIYRU-oROkIk8vfvxw6QvesZW2xOQ-xsNqO47m55DA.woff) format("woff");\
                            }\
                            body, html {\
                              margin: 0px;\
                              padding: 0px;\
                              -webkit-font-smoothing: antialiased;\
                              text-size-adjust: none;\
                              width: 100% !important;\
                              background: #F9F9FF;\
                              font-family: "Lato", "Lucida Grande", "Lucida Sans Unicode", Tahoma, Sans-Serif;\
                              word-break: break-word;\
                            }\
                            .contentMainTable {\
                              background: #FFFFFF;\
                              border: 1px solid #EEEEFF;\
                              margin-top: 98px;\
                              margin-bottom: 69px;\
                              margin-left: auto;\
                              margin-right: auto;\
                              width: 600px;\
                              height: 1003px;\
                            }\
                            .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div {\
                              line-height: 100%;\
                            }\
                            .ExternalClass {\
                              width: 100%;\
                            }\
                            .logoImage {\
                              margin-top: -50px;\
                              padding-bottom: 7px;\
                            }\
                            h1 {\
                              font-weight: bold;\
                              font-size: 30px;\
                              font-family: "Lato";\
                              letter-spacing: 0px;\
                              color: #25254E;\
                            }\
                            p {\
                              font-weight: 300;\
                              font-size: 14px;\
                              letter-spacing: 0px;\
                              color: #4D4D80;\
                            }\
                            .greyLine {\
                              border: 1px solid #CED7F7;\
                              width: 100%;\
                              margin-top: 32px\
                            }\
                            h2 {\
                              font-weight: bold;\
                              font-size: 15px;\
                              letter-spacing: 0px;\
                              color: #25254E;\
                            }\
                            h3 {\
                              font-weight: 300;\
                              font-size: 15px;\
                              letter-spacing: 0px;\
                              color: #4D4D80;\
                            }\
                            .footer {\
                              margin-top: 32px;\
                              margin-bottom: 20px;\
                              font-size: 11px;\
                              font-weight: 300px;\
                              color: #4D4D80;\
                            }\
                            .footerIcons img {\
                              margin-left: 11px;\
                              margin-right: 11px;\
                            }\
                            .blueButton {\
                              background: #8AA1EB;\
                              border-radius: 10px;\
                              padding: 17px 35px;\
                              border: none;\
                              color: #FFFFFF;\
                              font-size: 15px;\
                              margin-bottom: 32px;\
                              cursor: pointer;\
                            }\
                            .blueButton:focus {\
                              outline: none;\
                              border: 2px solid #5457FF;\
                              padding: 15px 33px;\
                            }\
                            @media only screen and (max-width: 480px) {\
                              table, table tr td, table td {\
                                width: 100%;\
                              }\
                              .contentMainTable {\
                                width: 100%;\
                                border: none;\
                              }\
                              body, html {\
                                background: #FFFFFF;\
                              }\
                              h1 {\
                                font-size: 24px;\
                              }\
                            }\
                          }\
                        </style>\
                        <title>\
                        </title>\
                        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">\
                      </head>\
                      <body style="padding:0; margin: 0;">\
                        <table border="0" cellpadding="0" cellspacing="0" height="100%" width="100%" id="body_table">\
                          <tbody>\
                            <tr>\
                              <td align="center" valign="top">\
                                <table border="0" cellpadding="20" cellspacing="0" width="100%" class="contentMainTable">\
                                  <tbody>\
                                    <tr>\
                                      <td align="center" valign="top">\
                                        <img class="logoImage" src="https://api.elasticemail.com/userfile/a18de9fc-4724-42f2-b203-4992ceddc1de/logodefaulttemplate.png" alt="#">\
                                        <table border="0" cellpadding="20" cellspacing="0" width="100%" id="content">\
                                          <tbody>\
                                            <tr>\
                                              <td align="center" valign="top">\
                                                <span class="isDesktop">\
                                                  <h1 style="margin-bottom: 32px">\
                                                    Recupero Password\
                                                  </h1>\
                                                  <p style="margin-top:0px">Ecco il link da Lei richiesto per il recupero della password: \
                                                  </p>\
                                                  <a href="http://localhost:8080/pswRecovery.html" target="_blank">http://eventmanagerzlf.herokuapp.com/pswRecovery.html</a></span>\
                                                <div class="greyLine">\
                                                </div>\
                                              </td>\
                                            </tr>\
                                          </tbody>\
                                        </table>\
                                      </td>\
                                    </tr>\
                                  </tbody>\
                                </table>\
                              </td>\
                            </tr>\
                          </tbody>\
                        </table>\
                      </body>\
                    </html>'
                })
            ],
            Subject: "Recupero password",
            From: "marvel00.ml@gmail.com"
        }
    });

    var callback = function (error, data, response) {
        if (error) {
            console.log(error);
            res.status(500).json({error: "Errore durante l'invio dell'email."}).send();
        } else {
            res.status(201).json({message: "Email inviata correttamente."}).send();
        }
    };
    api.emailsPost(email, callback);
});

module.exports = router;