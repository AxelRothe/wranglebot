import User from "../core/accounts/User.js";
interface EmailTemplateOptions {
    from: User;
    to: User;
    subject: string;
    body: string;
    button?: {
        text: string;
        link: string;
    };
}
declare class EmailTemplate {
    email: EmailTemplateOptions;
    constructor(email: EmailTemplateOptions);
    compile(): {
        from: string;
        to: string;
        replyTo: string;
        subject: string;
        text: string;
        html: string;
    };
    private render;
}
export { EmailTemplate, EmailTemplateOptions };
//# sourceMappingURL=EmailTemplate.d.ts.map