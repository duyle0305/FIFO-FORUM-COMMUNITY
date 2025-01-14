import type { RootState } from '@/stores';
import type { SignUpRequest } from '@/types/auth';
import type { FormProps } from 'antd';
import type { FC } from 'react';

import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { css } from '@emotion/react';
import { App, Divider, Form, Input } from 'antd';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import GooglIcon from '@/assets/icons/Google.svg';
import AuthFormWrapper from '@/components/authen/form-wrapper';
import AuthPageLayout from '@/components/authen/layout';
import BaseButton from '@/components/core/button';
import { useSignUp } from '@/hooks/mutate/auth/use-signup';
import { PATHS } from '@/utils/paths';

type FieldType = {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
};

const SignUpPage: FC = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { loading } = useSelector((state: RootState) => state.global);
    const { mutate: signup } = useSignUp();
    const { message } = App.useApp();

    // Function to validate password confirmation
    const validateConfirmPassword = (_: any, value: string) => {
        const password = form.getFieldValue('password');

        if (value && value !== password) {
            return Promise.reject(new Error('Passwords do not match!'));
        }

        return Promise.resolve();
    };

    const onFinish: FormProps<FieldType>['onFinish'] = async values => {
        const req: SignUpRequest = {
            email: values.email,
            username: values.username,
            password: values.password,
            confirmPassword: values.confirmPassword,
            avatar: 'https://firebasestorage.googleapis.com/v0/b/image-description-detail.appspot.com/o/files%2Fz5864107407458_5df9a91f942a87874a58701fea121a3f.jpg?alt=media&token=00f9cd4e-2112-45b0-a250-300419033950',
            coverImage:
                'https://firebasestorage.googleapis.com/v0/b/image-description-detail.appspot.com/o/files%2FFIFO%20cover.8f4ed563.png?alt=media&token=c92815f3-cd45-4f5b-a71a-7f8f6e08ff65',
            address: '',
            gender: '',
            role: 'USER',
            categoryList_ForStaff: [],
        };

        signup(req, {
            onSuccess: result => {
                if (result) {
                    // message.success('Registration account successfully');
                    localStorage.setItem('email', values.email);
                    navigate(PATHS.OTP_VERIFICATION);
                }
            },
            onError: error => {
                message.error(error.message);
            },
        });
    };

    const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = errorInfo => {
        // console.log('Failed:', errorInfo);
    };

    return (
        <div css={styles}>
            <AuthPageLayout>
                <AuthFormWrapper title="SIGN UP">
                    <Form form={form} initialValues={{}} onFinish={onFinish} onFinishFailed={onFinishFailed}>
                        <Form.Item<FieldType>
                            name="username"
                            rules={[
                                { required: true, message: 'Please input your username!' },
                                { min: 8, message: 'Username must be at least 8 characters' },
                                { max: 20, message: 'Username cannot exceed 20 characters' },
                            ]}
                        >
                            <Input size="large" width={100} placeholder="Username" prefix={<UserOutlined />} />
                        </Form.Item>

                        <Form.Item<FieldType>
                            name="email"
                            rules={[
                                { required: true, message: 'Please input email!' },
                                { type: 'email', message: 'Please input a valid email!' },
                            ]}
                        >
                            <Input size="large" width={100} placeholder="Email" prefix={<MailOutlined />} />
                        </Form.Item>

                        <Form.Item<FieldType>
                            name="password"
                            rules={[
                                { required: true, message: 'Please input your password!' },
                                { min: 8, message: 'Password must be at least 8 characters' },
                                { max: 20, message: 'Passowrd cannot exceed 20 characters' },
                            ]}
                        >
                            <Input.Password size="large" width={100} placeholder="Password" prefix={<LockOutlined />} />
                        </Form.Item>

                        <Form.Item<FieldType>
                            name="confirmPassword"
                            rules={[
                                { required: true, message: 'Please input your confirm password!' },
                                {
                                    validator: validateConfirmPassword, // Custom validator for password match
                                },
                            ]}
                        >
                            <Input.Password
                                size="large"
                                width={100}
                                placeholder="Confirm Password"
                                prefix={<LockOutlined />}
                            />
                        </Form.Item>

                        <Form.Item>
                            <BaseButton
                                size="large"
                                className="auth-submit-button"
                                shape="round"
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                            >
                                Create a new account
                            </BaseButton>
                        </Form.Item>
                    </Form>

                    {/* <Divider plain className="divider">
                        <span>Or</span>
                    </Divider> */}

                    {/* <BaseButton htmlType='button' size="large" variant="outlined" shape="round" className="btn-google" disabled={loading}>
                        <img src={GooglIcon}></img>
                        <span>Google</span>
                    </BaseButton> */}

                    <div className="link-create-account">
                        <p>Do you already have an account?</p>
                    </div>

                    <BaseButton
                        htmlType="button"
                        size="large"
                        variant="outlined"
                        shape="round"
                        className="btn-registration"
                        disabled={loading}
                    >
                        <Link to={PATHS.SIGNIN}>
                            <span>Signin</span>
                        </Link>
                    </BaseButton>
                </AuthFormWrapper>
            </AuthPageLayout>
        </div>
    );
};

const styles = css(`
    .link-forgot-password {
        text-align: right;
    }

    .link-create-account {
        text-align: center;
        color: #ccc;
    }
    
    .divider span {
        color: #ccc;
    }
    
    .btn-google,.btn-registration {
        color: #3949AB;
    }
`);

export default SignUpPage;
