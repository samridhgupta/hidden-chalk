
const soundFileKeyMap = {
    APP_INTRO_SOUND: 'app_intro_sound.mp3',
    UNLOCK_COURSE_SOUND: 'unlock_course_sound.mp3',
    SUBMIT_ANSWER_CORRECT_SOUND: 'correct_answer_sound.mp3',
    SUBMIT_ANSWER_INCORRECT_SOUND: 'incorrect_answer_sound.mp3',
    MODULE_COMPLETE_SOUND: 'module_complete_sound.mp3',
    COURSE_COMPLETE_SOUND: 'course_complete_sound.mp3',
    USER_LOGIN_SOUND: 'user_login_sound.mp3',
    USER_LOGOUT_SOUND: 'user_logout_sound.mp3',
    SPINWHEEL_OPEN_SOUND: 'spinwheel_open_sound.mp3',
    SPINWHEEL_SPIN_SOUND: 'spinwheel_spin_sound.mp3',
    SPINWHEEL_REWARD_SOUND: 'spinwheel_reward_sound.mp3',
    SPINWHEEL_CLOSE_SOUND: 'spinwheel_close_sound.mp3'
}

const soundKeyConstants = Object.keys(soundFileKeyMap).reduce((object, key)=>{
    object[key]= key
    return object;
},{});

export { soundFileKeyMap, soundKeyConstants };