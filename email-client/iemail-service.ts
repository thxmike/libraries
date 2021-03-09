export interface IEmailService {
    setup_transport() : Promise<any> ;
    setup_template(): Promise<void>;
    send_message(email_to: string, email_from: string, content: string, subject: string): Promise<any>;
    validate_email(email: string): boolean;
}