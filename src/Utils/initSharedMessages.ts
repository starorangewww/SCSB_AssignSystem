export function initSharedMessages() {
  const stored = localStorage.getItem("sharedMessages");

  if (!stored) {
    const baseMessages = [
      {
        id: 1,
        sender: "總經理室",
        senderRole: "general_manager",
        recipientRole: "area_manager",
        subject: "行銷成效回報",
        preview: "請回報各區行銷進度。",
        content: "請於本週五下午五點前提交行銷報告。",
        time: "08:00 AM",
        starred: true,
      },
      {
        id: 2,
        sender: "北一區協理辦公室",
        senderRole: "area_manager",
        recipientRole: "branch_manager",
        subject: "行銷活動推廣通知",
        preview: "請各分行依照行銷方案執行進度進行回報。",
        content:
          "各分行請於本週五下午五點前完成最新行銷活動報告填寫，並於下週一前回傳。",
        time: "09:00 AM",
        starred: true,
      },
      {
        id: 3,
        sender: "儲蓄部分行經理",
        senderRole: "branch_manager",
        recipientRole: "rm",
        subject: "客戶潛力名單通知",
        preview: "請RM整理潛力客戶名單並於週五回覆。",
        content: "請整理潛力客戶名單，並於週五前上傳至內部系統。",
        time: "10:00 AM",
        starred: false,
      },
    ];

    const duplicated = baseMessages.flatMap((msg) => [
      {
        ...msg,
        id: msg.id * 10 + 1,
        ownerRole: msg.senderRole,
        box: "寄件備份",
        replies: [],
      },
      {
        ...msg,
        id: msg.id * 10 + 2,
        ownerRole: msg.recipientRole,
        box: "收件夾",
        replies: [],
      },
    ]);

    localStorage.setItem("sharedMessages", JSON.stringify(duplicated));
    console.log("✅ sharedMessages 已初始化（寄件人＋收件人雙份信件）");
  }
}
