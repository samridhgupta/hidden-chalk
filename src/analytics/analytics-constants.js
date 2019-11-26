export default {
  screens: {
    SPLASH_SCREEN: { name: "Splash Screen" },
    CLASS_DASHBOARD_SCREEN: { name: "Class Dashboard Screen" },
    COURSEWORK_SCREEN: { name: "CourseWork Screen" },
    FORGOT_PASSWORD_SCREEN: { name: "Forgot Password Screen" },
    LANDING_SCREEN: { name: "Landing Screen" },
    LOGIN_SCREEN: { name: "Login Screen" },
    RESET_PASSWORD_SCREEN: { name: "Reset Password Screen" },
    SIGNUP_SCREEN: { name: "SignUp Screen" },
    SIGNUP_CONFIRMATION_SCREEN: { name: "SignUp Confirmation Screen" },
    STUDENT_DASHBOARD_SCREEN: { name: "Student Dashboard Screen" },
    UNLOCK_COURSE_SCREEN: { name: "Unlock Course Screen" },
    WORKPAD_SCREEN: { name: "WorkPad Screen" }
  },
  events: {
    MODULE_CLICK: {
      name: "module_click",
      parameterKeys: ["module_name", "module_id"],
      description:
        "Event signifying a user tapping on a module in a course to continue with their course",
    },
    SECTION_CLICK: {
      name: "section_click",
      parameterKeys: ["section_name", "section_id"],
      description:
        "Event signifying a user tapping on a section in a module to continue with their course",
    },
    CONTINUE_COURSE_CLICK: {
      name: "continue_course_click",
      parameterKeys: ["course_name", "course_id"],
      description:
        "Event signifying a user tapping on 'continue with course' button in course dashboard screen",
    },
    PAGE_DRAWER_CLICK: {
      name: "page_drawer_click",
      parameterKeys: [],
      description: "Event signifying a user tapping on page drawer toggle button in CourseWork Screen",
    },
    COURSE_WORK_PAGE_VIEW: {
        name: "course_work_page_view",
        parameterKeys: ["page_id", "section_id", "module_id", "course_id"],
        description: "Event signifying a user viewing a page in CourseWork Screen",
    },
    SPIN_WHEEL_PROMPT: {
        name: "spin_wheel_prompt",
        parameterKeys: [],
        description: "Event signifying a user has been prompted to play the spin wheel game",
    },
    SPIN_WHEEL_AFFIRM: {
        name: "spin_wheel_affirm",
        parameterKeys: [],
        description: "Event signifying a user has accepted to play the spin wheel game",
    },
    LOGIN: {
        name: "login",
        parameterKeys: ["login_method", "sign_up_method"],
        description: "Event signifying a user logging in to the app",
    },
    LOGOUT: {
        name: "logout",
        parameterKeys: [],
        description: "Event signifying a user logging out of the app",
    },
    SIGN_UP: {
        name: "sign_up",
        parameterKeys: ["sign_up_method"],
        description: "Event signifying a user successfully submiting signup form",
    },
    SIGN_UP_CONFIRM: {
        name: "sign_up_confirm",
        parameterKeys: [],
        description: "Event signifying a user successfully confirming their email upon signup",
    },
    COURSE_CLICK: {
        name: "course_click",
        parameterKeys: ["course_name", "course_id"],
        description: "Event signifying a user tapping on a course in student dashboard screen",
    },
    COURSE_UNLOCKED: {
        name: "course_unlocked",
        parameterKeys: ["course_name", "course_id"],
        description: "Event signifying a user successfully unlocking a course."
    },
    TOOL_CHANGE_CLICK: {
        name: "tool_change_click",
        parameterKeys: ["tool_name"],
        description: "Event signifying a user changing work pad tool either from pen or eraser"
    }
  },
  userProperties: {
      EMAIL: { name: 'email' }
  }
};
