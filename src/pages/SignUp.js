import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    Image,
    TextInput,
    Platform,
    Picker,
    TouchableHighlight,
    Linking
} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Entypo';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import Container from './components/Container';
import TouchableView from './components/TouchableView';
import Button from './components/Button';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AwsCognito from 'react-native-aws-cognito';
import Snackbar from 'react-native-snackbar';
import base64UUID from '../libs/base64UUID';
import { AwsS3 } from 'react-native-aws-s3';
import Analytics from '../analytics';
import AnalyticsConstants from '../analytics/analytics-constants';
import s3Config from '../config/aws/s3-config';
import schoolData from '../config/schoolData';


let defaultAvatar = require('../media/DefaultUserImage.png');

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    textboxContainer: {
        justifyContent: 'center',
    },
    textboxContainerWithValidation:
    {
        borderWidth: 2,
        borderColor: 'rgba(194,0,0,0.6)',
        borderRadius: 5,
    },
    scrollview: {
        flex: 1,
        backgroundColor: '#65b4ce',
        paddingHorizontal: 30,
        flexDirection: 'column'
    },
    imagecontainer: {
        backgroundColor: '#65b4ce',
        justifyContent: 'center',
        alignItems: 'center'
    },
    emailContainer: {
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'white',
        borderRadius: 5,
        backgroundColor: 'white',
        height: 52
    },
    submit: {
        backgroundColor: '#ffffff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#fff',
        marginTop: 5,
        marginHorizontal: 24
    },
    buttonBlackText: {
        fontSize: 15,
        color: '#595856',
        fontWeight: 'bold'
    },
    titleTextLabel: {
        fontSize: 18,
        color: 'white',
        fontWeight: "600"
    },
    textLabel: {
        marginTop: 12,
        fontSize: 18,
        fontWeight: '500',
        color: 'white',
        textAlign: 'center'
    },
    imageLabel: {
        marginTop: 4,
        fontSize: 15,
        fontWeight: '600',
        color: 'white',
        marginBottom: 10
    },
    imageLabelWithValidation: {
        marginTop: 4,
        fontSize: 15,
        fontWeight: '700',
        color: 'rgba(194,0,0,0.6)',
        marginBottom: 10
    },
    textbox: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: 'white',
        borderRadius: 5,
        padding: 15,
        fontSize: 18,
        fontWeight: "600",
        height: 50,
        color: '#595856'
    },
    schoolTextbox: {
        ...Platform.select({
            ios: {
                height: 50,
                backgroundColor: 'white',
                borderWidth: 1,
                borderColor: 'white',
                borderRadius: 5,
                padding: 15,
                fontSize: 18,
                fontWeight: "600",
                color: '#595856'
            },
            android: {
                height: 0
            }
        }),
    },
    schoolPicker: {
        ...Platform.select({
            ios: {
                backgroundColor: 'rgba(255,255,255,100)',
                borderRadius: 5,
                borderTopWidth: 2,
                borderColor: '#65b4ce'
            },
            android: {
                borderWidth: 1,
                borderColor: 'white',
                borderRadius: 5,
                backgroundColor: 'white',
                height: 46
            }
        }),
    },
    imagePickerButton: {
        height: 80,
        width: 80,
        borderRadius: 40,
        marginTop: 10,
        marginHorizontal: 10,
        borderWidth: 2,
        borderColor: '#e1e1e1'
    },
    imagePickerButtonWithValidation: {
        height: 80,
        width: 80,
        borderRadius: 40,
        marginTop: 10,
        marginHorizontal: 10,
        borderWidth: 2,
        borderColor: 'rgba(194,0,0,0.6)'
    },
    profileImage: {
        height: 76,
        width: 76,
        borderRadius: 38
    },
    pickerContainer: {
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                borderRadius: 5
            },
            android: {
                paddingLeft: 7,
                borderWidth: 2,
                borderColor: 'white',
                borderRadius: 5,
                backgroundColor: 'white'
            }
        }),
    },
    pickerContainerWithValidation: {
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                borderRadius: 5,
                borderColor: 'rgba(194,0,0,0.6)',
                borderWidth: 2,
            },
            android: {
                padding: 7,
                borderWidth: 2,
                borderColor: 'rgba(194,0,0,0.6)',
                borderRadius: 5,
                backgroundColor: 'white',
                height: 50
            }
        }),
    },
    footerText: {
        marginTop: 4,
        fontSize: 12,
        fontWeight: '500',
        color: 'white',
        textAlign: 'center'
        // marginBottom: 10
    },
    footerLink: {
        color: 'blue'
    }
});
var imagePickerOptions = {
    title: 'Select Profile Image',
    mediaType: 'photo',
    quality: 0.5,
    noData: true
};
const Item = Picker.Item;
class SignUp extends Component {

    // const { navigate } = props.navigation;
     static navigationOptions = {
        title: 'Sign Up',
        headerBackTitle: null,
        headerStyle: {
            backgroundColor: "#65b4ce"
        },
        headerTintColor: "white",
        headerTitleStyle: styles.titleTextLabel
    };

    constructor(props) {
        super(props);
        this.navigate = props.navigation.navigate;
        this.state = {
            isLoading: false,
            schoolDefault: 'Select School',
            schoolIndex: 1,
            emailValidationMessage: "Email Required.",
            firstNameValidationMessage: "First Name Required.",
            lastNameValidationMessage: "Last Name Required.",
            passwordValidationMessage: "Password Required.",
            schoolValidationMessage: "Please select your School.",
            confirmPasswordValidationMessage: "Confirm Password Required.",
            displayPicker: false,
            showEmailValidation: true,
            showFirstNameValidation: true,
            showLastNameValidation: true,
            showPasswordValidation: true,
            showSchoolValidation: true,
            showConfirmPasswordValidation: true,
            submitClicked: false,
            profileImageSource: {
                uriSource: defaultAvatar
            },
            profileImageSelected: false,
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: ''
        };
    };

    componentDidMount() {
        Analytics.setScreenName(AnalyticsConstants.screens.SIGNUP_SCREEN.name);
    }

    openImagePicker() {
        ImagePicker.showImagePicker(imagePickerOptions, (response) => {
            console.log('Response = ', response);

            if (response.didCancel) {
                console.log('User cancelled image picker');
            }
            else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            }
            else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            }
            else {
                this.setState({
                    profileImageSelected: true,
                    profileImageSource: {
                        uriSource: { uri: response.uri },
                        path: response.path
                    }
                });
            }
        });
    }

    togglePicker() {
        if (Platform.OS === 'ios') {
            let hidden = !this.state.displayPicker;
            if (this.state.schoolIndex < 0)
                this.setState({ schoolIndex: 0 })
            this.setState({ displayPicker: hidden });
        }
    }
    onChangeFirstNameAndValidate(text) {
        var reg = /^[a-z ,.'-]+$/i;
        this.setState({ firstName: text });
        if (text.length < 0) {
            this.setState({ showFirstNameValidation: true });
            this.setState({ firstNameValidationMessage: "Please enter your First Name." });
        }
        else if ((text.length < 2)) {
            this.setState({ showFirstNameValidation: true });
            this.setState({ firstNameValidationMessage: "First Name should contain atleast 2 characters." });
        }
        else if (!reg.test(text)) {
            this.setState({ showFirstNameValidation: true });
            this.setState({ firstNameValidationMessage: "First Name can only contain letters (a-z)." });
        }
        else {
            this.setState({ showFirstNameValidation: false });
            this.setState({ firstNameValidationMessage: "" });
        }
    }
    onChangeLastNameAndValidate(text) {
        var reg = /^[a-z ,.'-]+$/i;
        this.setState({ lastName: text });
        if (text.length < 0) {
            this.setState({ showLastNameValidation: true });
            this.setState({ lastNameValidationMessage: "Please enter your Last Name." });
        }
        else if ((text.length < 2)) {
            this.setState({ showLastNameValidation: true });
            this.setState({ lastNameValidationMessage: "Last Name should contain atleast 2 characters." });
        }
        else if (!reg.test(text)) {
            this.setState({ showLastNameValidation: true });
            this.setState({ lastNameValidationMessage: "Last Name can only contain letters (a-z)." });
        }
        else {
            this.setState({ showLastNameValidation: false });
            this.setState({ lastNameValidationMessage: "" });
        }
    }

    onChangeEmailAndValidate(text) {


        if (this.state.schoolIndex < 0) {

            this.setState({ showEmailValidation: true }),
                this.setState({ emailValidationMessage: "Please select your School first." })
        } else {

            this.setState({ email: (text) + (schoolData[this.state.schoolIndex].domain) });
            if (!this.validateEmail((text) + (schoolData[this.state.schoolIndex].domain))) {
                this.setState({ showEmailValidation: true });
                this.setState({ emailValidationMessage: "Please enter a valid Email." })
            }
            else {
                this.setState({ showEmailValidation: false });
                this.setState({ emailValidationMessage: "" });
            }
        }
    }

    validateEmail = (email) => {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    };

    onChangePasswordAndValidate(text) {
        var re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*()]{8,}$/;
        this.setState({ password: text });
        if (text.length < 0) {
            this.setState({ showPasswordValidation: true });
            this.setState({ passwordValidationMessage: "Password Required." });
        }
        else if (text.length < 8) {
            this.setState({ showPasswordValidation: true });
            this.setState({ passwordValidationMessage: "Password should contain atleast 8 characters." });
        }
        else if (!re.test(text)) {
            this.setState({ showPasswordValidation: true });
            this.setState({ passwordValidationMessage: "Password should include at least 1 Uppercase Letter, 1 Lowercase Letter and 1 Number." });
        }
        else {
            this.setState({ showPasswordValidation: false });
            this.setState({ passwordValidationMessage: "" });
        }
    }

    onChangeConfirmPasswordAndValidate(text) {
        this.setState({ confirmPassword: text });
        if (text.length <= 0) {
            this.setState({ showConfirmPasswordValidation: true });
            this.setState({ confirmPasswordValidationMessage: "Confirm Password Required." });
        }
        else if (text !== this.state.password) {
            this.setState({ showConfirmPasswordValidation: true });
            this.setState({ confirmPasswordValidationMessage: "Passwords don't match." });
        }
        else {
            this.setState({ showConfirmPasswordValidation: false });
            this.setState({ confirmPasswordValidationMessage: "" });
        }
    }

    schoolPicker() {
        if (Platform.OS === 'ios') {
            return (
                <Container>
                    <TouchableView
                        style={((this.state.schoolIndex < 0) && this.state.submitClicked) ? styles.pickerContainerWithValidation : styles.pickerContainer}
                        onPress={this.togglePicker.bind(this)} underlayColor='white'>
                        <View style={StyleSheet.flatten([styles.pickerContainer, { flexDirection: 'row', backgroundColor: 'white' }])}>

                            <TextInput style={StyleSheet.flatten([styles.schoolTextbox, { flex: 1 }])} underlineColorAndroid='transparent' editable={false}
                                placeholder="Select School"
                                placeholderTextColor="#CDCDCD"
                                value={(this.state.schoolIndex < 0 && this.state.schoolIndex) ? null : schoolData[this.state.schoolIndex].name} />
                            {this.state.displayPicker ?
                                (<Icon style={{ alignSelf: 'center', paddingRight: 10, fontSize: 18 }} name="chevron-down" color="#A9A9A9" />) : (<Icon style={{ alignSelf: 'center', paddingRight: 10, fontSize: 18 }} name="chevron-right" color="#A9A9A9" />)}

                        </View>
                    </TouchableView>
                    {this.state.displayPicker &&
                        (<Picker
                            style={styles.schoolPicker}
                            selectedValue={(this.state.schoolIndex < 0 && this.state.schoolIndex) ? null : schoolData[this.state.schoolIndex].name}
                            onValueChange={(school, i) => this.setState({ schoolDefault: school, schoolIndex: i })}
                            itemStyle={{ fontSize: 18, fontWeight: '900' }}>
                            {
                                schoolData.map((school, index) => {
                                    return (
                                        <Item key={index} value={school.name} label={school.name} />
                                    );
                                }
                                )
                            }
                        </Picker>)}
                    {((this.state.schoolIndex < 0) && this.state.submitClicked) && (<View style={{ flexDirection: 'row' }}><IconMaterial style={{ paddingTop: 5, fontSize: 18 }} name="error" color='rgba(194,0,0,0.6)' /><Text style={{ color: 'rgba(194,0,0,0.6)', paddingTop: 5, paddingLeft: 3, flex: 1, fontWeight: '500' }}>{this.state.schoolValidationMessage}</Text></View>)}

                </Container>
            );
        }
        else if (Platform.OS === 'android') {
            return (
                <Container>
                    <View style={((this.state.schoolIndex < 0) && this.state.submitClicked) ? styles.pickerContainerWithValidation : styles.pickerContainer}>
                        <View style={styles.pickerContainer}>
                            <Picker
                                prompt={"Select School"}
                                style={[styles.schoolPicker]}
                                selectedValue={schoolData[this.state.schoolIndex].name}
                                onValueChange={(school, index) => this.setState({ schoolDefault: school, schoolIndex: index })} >
                                {schoolData.map((school, index) => {
                                    return (<Item key={index}
                                        value={school.name}
                                        label={"  " + school.name} />)
                                })}
                            </Picker>
                        </View>
                    </View>
                    {((this.state.schoolIndex < 0) && this.state.submitClicked) && (<View style={{ flexDirection: 'row' }}><IconMaterial style={{ paddingTop: 5, fontSize: 18 }} name="error" color='rgba(194,0,0,0.6)' /><Text style={{ color: 'rgba(194,0,0,0.6)', paddingTop: 5, paddingLeft: 3, flex: 1, fontWeight: '500' }}>{this.state.schoolValidationMessage}</Text></View>)}
                </Container>
            );
        }
    }

    onSubmitPressed() {
        this.setState({ submitClicked: true });
        if (!this.validateUserSignUp())
            return;
        this.signupUser();
    }

    signupUser() {
        this.setState({ isLoading: true });
        let uuid = base64UUID.escapedBase64UUID();
        let email = this.state.email.toLowerCase();
        let firstName = this.state.firstName;
        let lastName = this.state.lastName;
        let username = uuid;
        let schoolID = schoolData[this.state.schoolIndex].id;
        let imageGUID = base64UUID.escapedBase64UUID();

        console.log("Signup: Start");

        AwsCognito.signUpAsync(username, this.state.password,
            {
                email: email,
                given_name: firstName,
                family_name: lastName,
                "custom:school_id": schoolID,
                "custom:profile_image_id": imageGUID
            }).then((res) => {
                console.log('AWS Signup success', res);
                Analytics.logEvent(AnalyticsConstants.events.SIGN_UP.name, {
                    sign_up_method: 'Email Address'
                });
                let imageURI = this.state.profileImageSource.path || this.state.profileImageSource.uriSource.uri
                this.uploadImageToS3(imageURI, imageGUID).then((res) => {
                    console.log("Upload Success: ", res);
                }).catch((error) => {
                    console.log("Error uploading: ", error);
                });
                this.navigate('SignUpConfirmation', { email: this.state.email, username: username });
                this.setState({ isLoading: false });
            })
            .catch((error) => {
                console.log('AWS Signup Failure:', error);
                Snackbar.show({
                    title: 'SignUp Unsuccessful. Please try again.',
                    duration: 5000,
                    backgroundColor: '#f44336',
                    action: {
                        title: 'DISMISS',
                        onPress: () => { console.log("Dismiss Pressed") },
                        color: 'white'
                    },
                });
                this.setState({ isLoading: false });
            });
    }

    uploadImageToS3(filePath, imageGUID, progressCallback) {

        let uploadPromise = new Promise((resolve, reject) => {
            AwsS3.createUploadRequest({
                bucket: 'hidden-chalk-prod',
                key: `${s3Config.profileImageBaseKey}/${imageGUID}`,
                contenttype: 'image/jpeg',
                path: filePath,
                subscribe: true,
                completionhandler: true
            }, (error, requestid) => {
                if (error) {
                    console.log("Upload RequestError: ", error);
                    reject(error);
                    return;
                }
                if (progressCallback)
                    AwsS3.addProgressCallback(requestid, progressCallback);

                AwsS3.addCompletedCallback(requestid, (requestid, error, response) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve(response);
                });

                AwsS3.upload({ requestid: requestid });

            });
        });

        uploadPromise.then((res) => {
            console.log("upload success: ", res);
        });

        return uploadPromise;
    }

    validateUserSignUp() {
        if (this.state.showFirstNameValidation ||
            this.state.showLastNameValidation ||
            this.state.showEmailValidation ||
            this.state.showPasswordValidation ||
            this.state.showConfirmPasswordValidation ||
            !this.state.profileImageSelected
        )
            return false;
        return true;
    }


    onTermAndConditionClicked = () => {
        Linking.openURL("http://bit.do/HCTermsofUse").catch(err => console.error('An error occurred', err));
    }

    onPrivacyPolicyClicked = () => {
        Linking.openURL("http://bit.do/HCPrivacyPolicy").catch(err => console.error('An error occurred', err));
    }

    renderFooter() {
        return (
            <View style={{ alignItems: 'center' }}>
                <Text style={styles.footerText}> By clicking the Sign Up button, you agree to our {"\n"}
                    <Text style={styles.footerLink} onPress={this.onTermAndConditionClicked}> Terms of Use </Text>
                    and
                    <Text style={styles.footerLink} onPress={this.onPrivacyPolicyClicked}> Privacy Policy </Text>
                </Text>
            </View>
        )
    }

    render() {
        return (
            <KeyboardAwareScrollView style={styles.scrollview}>
                <Text style={styles.textLabel}>We need following information to connect your Hidden Chalk account with your School.</Text>
                <View style={{ alignItems: 'center' }}>
                    <TouchableView style={(!this.state.profileImageSelected && this.state.submitClicked) ? styles.imagePickerButtonWithValidation : styles.imagePickerButton}
                        onPress={this.openImagePicker.bind(this)}>
                        <Image style={styles.profileImage}
                            source={this.state.profileImageSource.uriSource}
                        />
                    </TouchableView>
                    <Text style={(!this.state.profileImageSelected && this.state.submitClicked) ? styles.imageLabelWithValidation : styles.imageLabel}>Select Picture</Text>
                </View>

                <Container>
                    <View style={(this.state.showFirstNameValidation && this.state.submitClicked) ? styles.textboxContainerWithValidation : styles.textboxContainer}>
                        <TextInput style={styles.textbox} underlineColorAndroid='transparent'
                            placeholder="First Name"
                            placeholderTextColor="#CDCDCD"
                            autoCapitalize={'words'}
                            autoCorrect={false}
                            returnKeyType={"next"}
                            onChangeText={this.onChangeFirstNameAndValidate.bind(this)}
                            onSubmitEditing={() => { this.refs.LastNameInput.focus() }} />
                    </View>
                    {(this.state.showFirstNameValidation && this.state.submitClicked) && (<View style={{ flexDirection: 'row' }}><IconMaterial style={{ paddingTop: 5, fontSize: 18 }} name="error" color="rgba(194,0,0,0.6)" /><Text style={{ color: 'rgba(194,0,0,0.6)', paddingTop: 5, paddingLeft: 3, flex: 1, fontWeight: '500' }}>{this.state.firstNameValidationMessage}</Text></View>)}

                </Container>
                <Container>
                    <View style={(this.state.showLastNameValidation && this.state.submitClicked) ? styles.textboxContainerWithValidation : styles.textboxContainer}>
                        <TextInput style={styles.textbox} underlineColorAndroid='transparent'
                            ref='LastNameInput'
                            autoCorrect={false}
                            placeholder="Last Name"
                            autoCapitalize={'words'}
                            placeholderTextColor="#CDCDCD"
                            returnKeyType={"next"}
                            onChangeText={this.onChangeLastNameAndValidate.bind(this)}
                            onSubmitEditing={() => { this.refs.emailInput.focus() }} />
                    </View>
                    {(this.state.showLastNameValidation && this.state.submitClicked) && (<View style={{ flexDirection: 'row' }}><IconMaterial style={{ paddingTop: 5, fontSize: 18 }} name="error" color="rgba(194,0,0,0.6)" /><Text style={{ color: 'rgba(194,0,0,0.6)', paddingTop: 5, paddingLeft: 3, flex: 1, fontWeight: '500' }}>{this.state.lastNameValidationMessage}</Text></View>)}
                </Container>

                <Container>
                    <View style={(this.state.showEmailValidation && this.state.submitClicked) ? styles.textboxContainerWithValidation : styles.textboxContainer}>
                        <View style={StyleSheet.flatten([styles.emailContainer, { flexDirection: 'row' }])}>
                            <TextInput style={StyleSheet.flatten([styles.textbox, { flex: 1, height: 50 }])} underlineColorAndroid='transparent'
                                ref='emailInput'
                                keyboardType="email-address"
                                placeholder="Email"
                                autoCapitalize={'none'}
                                placeholderTextColor="#CDCDCD"
                                autoCorrect={false}
                                returnKeyType={"next"}
                                onChangeText={this.onChangeEmailAndValidate.bind(this)}
                                onSubmitEditing={() => { this.refs.passwordInput.focus() }} />
                            {/* <Text style={{ alignSelf: 'center', paddingRight: 10, color: '#595856', fontSize: 18, fontWeight: '600' }}>{((this.state.schoolIndex < 0 && this.state.schoolIndex) && (Platform.OS === 'ios')) ? '@' : schoolData[this.state.schoolIndex].domain}</Text> */}
                        </View>
                    </View>

                    {(this.state.showEmailValidation && this.state.submitClicked) && (<View style={{ flexDirection: 'row' }}><IconMaterial style={{ paddingTop: 5, fontSize: 18, }} name="error" color="rgba(194,0,0,0.6)" /><Text style={{ color: 'rgba(194,0,0,0.6)', paddingTop: 5, paddingLeft: 3, flex: 1, fontWeight: '500' }}>{this.state.emailValidationMessage}</Text></View>)}
                </Container>
                <Container>
                    <View style={(this.state.showPasswordValidation && this.state.submitClicked) ? styles.textboxContainerWithValidation : styles.textboxContainer}>
                        <TextInput
                            ref='passwordInput'
                            secureTextEntry={true}
                            returnKeyType={"next"}
                            style={styles.textbox} underlineColorAndroid='transparent'
                            placeholder="Password"
                            placeholderTextColor="#CDCDCD"
                            onChangeText={this.onChangePasswordAndValidate.bind(this)}
                            onSubmitEditing={() => { this.refs.confirmPasswordInput.focus() }} />
                    </View>
                    {(this.state.showPasswordValidation && this.state.submitClicked) && (<View style={{ flexDirection: 'row' }}><IconMaterial style={{ paddingTop: 5, fontSize: 18 }} name="error" color="rgba(194,0,0,0.6)" /><Text style={{ color: 'rgba(194,0,0,0.6)', paddingTop: 5, paddingLeft: 3, flex: 1, fontWeight: '500' }}>{this.state.passwordValidationMessage}</Text></View>)}

                </Container>
                <Container>
                    <View style={(this.state.showConfirmPasswordValidation && this.state.submitClicked) ? styles.textboxContainerWithValidation : styles.textboxContainer}>
                        <TextInput
                            ref='confirmPasswordInput'
                            secureTextEntry={true}
                            style={styles.textbox} underlineColorAndroid='transparent'
                            placeholder="Confirm Password"
                            placeholderTextColor="#CDCDCD"
                            onChangeText={this.onChangeConfirmPasswordAndValidate.bind(this)}
                            onSubmitEditing={this.onSubmitPressed.bind(this)} />
                    </View>
                    {(this.state.showConfirmPasswordValidation && this.state.submitClicked) && (<View style={{ flexDirection: 'row' }}><IconMaterial style={{ paddingTop: 5, fontSize: 18 }} name="error" color="rgba(194,0,0,0.6)" /><Text style={{ color: 'rgba(194,0,0,0.6)', paddingTop: 5, paddingLeft: 3, flex: 1, fontWeight: '500' }}>{this.state.confirmPasswordValidationMessage}</Text></View>)}

                </Container>
                <Container>
                    <Button
                        label="Sign Up"
                        isLoading={this.state.isLoading}
                        styles={{ button: styles.submit, label: styles.buttonBlackText }}
                        onPress={this.onSubmitPressed.bind(this)}
                    />
                    {this.renderFooter()}
                </Container>
            </KeyboardAwareScrollView>
        );
    }
}

export default SignUp = SignUp;