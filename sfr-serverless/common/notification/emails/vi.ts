import { IContentAndTitleForEmail, TypeContentTemplateEmail } from "./types";

export const contentAndTitleForEmail: { [key: string]: IContentAndTitleForEmail } = {
  [TypeContentTemplateEmail.MessageCreate]: {
    title: "{{currentUser}} vừa tạo tin nhắn mới",
    params: {
      action: "tạo một tin nhắn mới",
      modified: "Tin nhắn mới"
    }
  },
  [TypeContentTemplateEmail.MessageUpdate]: {
    title: "{{currentUser}} vừa cập nhật nội dung tin nhắn",
    params: {
      action: "cập nhật nội dung một tin nhắn",
      modified: "Nội dung tin nhắn"
    }
  },

  [TypeContentTemplateEmail.MessageUpdateMembers]: {
    title: "{{currentUser}} vừa cập nhật danh sách thành viên trong chủ đề",
    content: "Danh sách thành viên của tin nhắn đã được thay đổi",
    params: {
      action: "cập nhật danh sách thành viên của một tin nhắn",
      modified: "Danh sách thành viên"
    }
  },
  [TypeContentTemplateEmail.MessageAddComment]: {
    title: "{{currentUser}} vừa thêm một bình luận",
    params: {
      action: "thêm một bình luận cho tin nhắn",
      modified: "Bình luận"
    }
  },
  [TypeContentTemplateEmail.MessageAddAttachment]: {
    title: "{{currentUser}} vừa thay đổi tập tin đính kèm",
    content: "Tệp đính kèm của tin nhắn đã được thay đổi",
    params: {
      action: "cập nhật tập tin đính kèm cho tin nhắn",
      modified: "Tệp đính kèm"
    }
  },
  [TypeContentTemplateEmail.MessageClose]: {
    title: "{{currentUser}} vừa thêm file đính kèm",
    content: "Tin nhắn đã đóng vào lúc {{updatedAt}}",
    params: {
      action: "đóng một tin nhắn",
      modified: "Đóng tin nhắn"
    }
  },

  [TypeContentTemplateEmail.PlanCreate]: {
    title: "{{currentUser}} vừa tạo kế hoạch mới",
    params: {
      action: "tạo một kế hoạch mới",
      modified: "Kế hoạch mới"
    }
  },
  [TypeContentTemplateEmail.PlanUpdate]: {
    params: {
      action: "cập nhật nội dung một kế hoạch",
      modified: "Nội dung kế hoạch"
    }
  },

  [TypeContentTemplateEmail.PlanItemCreate]: {
    title: "{{currentUser}} vừa tạo một hạng mục mới",
    params: {
      action: "tạo một hạng mục mới",
      modified: "Tạo hạng mục mới"
    }
  },
  [TypeContentTemplateEmail.PlanItemUpdateContent]: {
    title: "{{currentUser}} vừa cập nhật nội dung cho hạng mục",
    params: {
      action: "cập nhật nội dung hạng mục",
      modified: "Nội dung hạng mục"
    }
  },

  [TypeContentTemplateEmail.ProjectCreate]: {
    title: "{{currentUser}} vừa tạo bảng công việc mới",
    params: {
      action: "tạo một bảng công việc mới",
      modified: "Bảng công việc mới"
    }
  },
  [TypeContentTemplateEmail.ProjectUpdate]: {
    title: "{{currentUser}} vừa cập nhật bảng công việc",
    params: {
      action: "cập nhật một bảng công việc",
      modified: "Nội dung bảng công việc"
    }
  },
  [TypeContentTemplateEmail.ProjectClose]: {
    title: "{{currentUser}} vừa tạo bảng công việc mới",
    params: {
      action: "tạo một bảng công việc mới",
      modified: "Đóng bảng công việc"
    },
    content: "Bảng công việc đã đóng vào lúc {{updatedAt}}"
  },

  [TypeContentTemplateEmail.ProjectTaskCreate]: {
    title: "{{currentUser}} vừa tạo một công việc mới",
    params: {
      action: "tạo một công việc mới",
      modified: "Tạo công việc mới"
    }
  },
  [TypeContentTemplateEmail.ProjectTaskUpdateContent]: {
    title: "{{currentUser}} vừa cập nhật nội dung cho công việc",
    params: {
      action: "cập nhật nội dung một công việc",
      modified: "Nội dung công việc"
    }
  },
  [TypeContentTemplateEmail.ProjectTaskUpdateDeadline]: {
    title: "{{currentUser}} vừa thay đổi hạn chót cho công việc",
    params: {
      action: "cập nhật hạn chót một công việc",
      modified: "Hạn chót công việc"
    },
    content: "Thay đổi hạn chót từ {{oldDeadline}} thành {{newDeadline}}"
  },
  [TypeContentTemplateEmail.ProjectTaskUpdateTaskStatus]: {
    title: "{{currentUser}} vừa thay đổi trạng thái công việc",
    params: {
      action: "cập nhật trạng thái một công việc",
      modified: "Trạng thái công việc"
    },
    content: "Thay đổi trạng thái từ {{oldStatus}} thành {{newStatus}}"
  },
  [TypeContentTemplateEmail.ProjectTaskUpdateEstimation]: {
    title: "{{currentUser}} vừa thay đổi ước lượng thời gian cho công việc",
    params: {
      action: "cập nhật ước lượng thời gian một công việc",
      modified: "Ước lượng thời gian công việc"
    },
    content: "Thay đổi ước lượng thời gian từ {{oldEstimation}} thành {{newEstimation}}"
  },
  [TypeContentTemplateEmail.ProjectTaskAddAttachment]: {
    title: "{{currentUser}} vừa thay đổi tập tin đính kèm",
    content: "Tệp đính kèm của công việc đã được thay đổi",
    params: {
      action: "cập nhật tập tin đính kèm cho công việc",
      modified: "Tệp đính kèm"
    }
  },
  [TypeContentTemplateEmail.ProjectTaskChangeAssignee]: {
    title: "{{currentUser}} vừa thay đổi người phân công cho công việc",
    content: "Thay đổi người được phân công từ {{oldAssignee}} thành {{newAssignee}}",
    params: {
      action: "thay đổi phân công một công việc",
      modified: "Phân công"
    }
  },
  [TypeContentTemplateEmail.ProjectTaskChangeReporter]: {
    title: "{{currentUser}} vừa thay đổi người phụ trách cho công việc",
    content: "Thay đổi người phụ trách từ {{oldReporter}} thành {{newReporter}}",
    params: {
      action: "thay đổi phụ trách một công việc",
      modified: "Phụ trách"
    }
  },
  [TypeContentTemplateEmail.ProjectTaskAddComment]: {
    title: "{{currentUser}} vừa thêm một bình luận cho công việc",
    params: {
      action: "cập nhật bình luận một công việc",
      modified: "Bình luận"
    }
  },
  [TypeContentTemplateEmail.ProjectTaskChangePrivate]: {
    title: "{{currentUser}} vừa bật/tắt tính năng bảo mật cho công việc",
    content: "Công việc được thay đổi tính bảo mật từ {{status}} sang {{status}}",
    params: {
      action: "cập nhật trạng thái bảo mật cho công việc",
      modified: "Bảo mật"
    }
  },
  [TypeContentTemplateEmail.ProjectTaskUpdateRating]: {
    title: "{{currentUser}}  vừa đánh giá cho công việc'",
    content: "Công việc được đánh giá với kết quả {{ratingName}}",
    params: {
      action: "cập nhật đánh giá kết quả công việc",
      modified: "Đánh giá"
    }
  },

  [TypeContentTemplateEmail.ReminderTask]: {
    title: "Công việc {{taskName}} sắp hết hạn hoàn thành",
    params: {
      type: "công việc",
      parent: "bảng công việc"
    }
  },
  [TypeContentTemplateEmail.ReminderPlanItem]: {
    title: "Hạng mục {{planItemName}} sắp hết hạn hoàn thành",
    params: {
      type: "hạng mục",
      parent: "kế hoạch"
    }
  }

};

// [TypeContentTemplateEmail.MessageUpdateMembersTypeNew]: {
//   title: "{{messageOwner}} vừa cập nhật danh sách thành viên trong chủ đề",
//   content: "{{currentUser}} vừa thêm {{newMember}} vào danh sách thành viên của tin nhắn này",
//   params: {
//     action: "cập nhật danh sách thành viên của một tin nhắn",
//     modified: "Danh sách thành viên"
//   }
// },
// [TypeContentTemplateEmail.MessageUpdateMembersTypeRemove]: {
//   title: "{{currentUser}} vừa cập nhật danh sách thành viên trong chủ đề",
//   content: "{{currentUser}} vừa xoá {{removeMember}} khỏi danh sách thành viên của tin nhắn này",
//   params: {
//     action: "cập nhật danh sách thành viên của một tin nhắn",
//     modified: "Danh sách thành viên"
//   }
// },
// [TypeContentTemplateEmail.MessageAddComment]: {
//   title: "{{currentUser}} vừa thêm file đính kèm",
//   content: "Tệp đính kèm được thêm vào gồm: {{attachmentList}}",
//   params: {
//     action: "thêm một bình luận cho tin nhắn",
//     modified: "Bình luận"
//   }
// },
