import sgMail, { MailDataRequired } from "@sendgrid/mail";
import { getErrorMessage } from "../utils/errors.util";
import { config } from "#configs/index";

const SendMail = async (message: MailDataRequired) => {
  try {
    sgMail.setApiKey(config.sendgrid.apiKey);
    sgMail.setSubstitutionWrappers("{{", "}}");

    await sgMail.send(message).catch((err) => {
      console.error(err);
    });
  } catch (err) {
    console.error(err);
  }
};

export { SendMail };
