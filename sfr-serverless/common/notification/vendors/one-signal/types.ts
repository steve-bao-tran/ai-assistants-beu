export interface ICreateNotificationPayload {

  contents: { [key: string]: string };
  headings?: { [key: string]: string };
  subtitle?: { [key: string]: string };
  data?: object;
  url?: string;
  template_id?: string;
}

export interface IBroadcastRequest extends ICreateNotificationPayload {
  app_id?: string;
}

export interface ICreateNotificationRequest extends IBroadcastRequest {
  included_segments?: string[];
  filters?: object[];
  include_player_ids?: string[];
}

export interface ICreateNotificationResults {
  id: string;
  recipients: number;
  errors: string[];
}
