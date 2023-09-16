import { Client } from '@sendgrid/client';
import * as Mail from '@sendgrid/mail';

interface IAttachment {
  content: string;
  filename: string;
  type: string;
  disposition: string;
  contentId: string;
}

export class SendGrid {
  constructor() {
    Mail.setClient(new Client());
    Mail.setApiKey(process.env.SENDGRID_API_KEY as string);
    Mail.setSubstitutionWrappers('{{', '}}');
  }

  async send(
    from: string,
    to: string,
    cc: string,
    subject: string,
    text: string,
    html: string,
    attachments: Array<IAttachment>
  ) {
    const msg = {
      to,
      cc,
      from,
      subject,
      text,
      html,
      attachments,
    };

    await Mail.send(msg);
  }

  async sendMultiple(
    from: string,
    to: Array<string>,
    cc: Array<string>,
    subject: string,
    text: string,
    html: string,
    attachments: Array<IAttachment>
  ) {
    const msg = {
      to,
      cc,
      from,
      subject,
      text,
      html,
      attachments,
    };

    await Mail.sendMultiple(msg);
  }

  async sendTemplate(from: string, to: Array<string>, cc: Array<string>, templateId: string, templateData: Object) {
    const msg = {
      to,
      cc,
      from,
      templateId,
      dynamic_template_data: templateData,
    };

    await Mail.send(msg);
  }
}
