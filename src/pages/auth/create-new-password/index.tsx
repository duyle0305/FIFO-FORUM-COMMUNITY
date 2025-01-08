import type { RootState } from '@/stores';
import type { FormProps } from 'antd';

import { LockOutlined } from '@ant-design/icons';
import { css } from '@emotion/react';
import { Form, Input } from 'antd';
import { type FC, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import AuthFormWrapper from '@/components/authen/form-wrapper';
import AuthPageLayout from '@/components/authen/layout';
import AuthResultPage from '@/components/authen/result';
import BaseButton from '@/components/core/button';
import { useResetPassword } from '@/hooks/mutate/auth/use-reset-password';
import { useMessage } from '@/hooks/use-message';
import { SuccessfulIcon } from '@/utils/asset';
import { PATHS } from '@/utils/paths';

type FieldType = {
    password: string;
    confirmPassword: string;
};

const CreateNewPasswordPage: FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loading } = useSelector((state: RootState) => state.global);
    const email = useSelector((state: RootState) => state.account?.email);
    const [form] = Form.useForm();

    const message = useMessage();
    const { mutate: resetPassword } = useResetPassword();
    const [verifySuccess, setVerifySuccess] = useState(false);

    // Function to validate password confirmation
    const validateConfirmPassword = (_: any, value: string) => {
        const password = form.getFieldValue('password');

        if (value && value !== password) {
            return Promise.reject(new Error('Passwords do not match!'));
        }

        return Promise.resolve();
    };

    const onFinish: FormProps<FieldType>['onFinish'] = async values => {
        resetPassword(
            {
                email: email as string,
                password: values.password,
                confirmPassword: values.confirmPassword,
            },
            {
                onSuccess: () => {
                    // navigate(PATHS.SIGNIN);
                    setVerifySuccess(true);
                    setTimeout(function () {
                        navigate(PATHS.SIGNIN);
                    }, 300000); // 5 minutes in milliseconds
                    // message.success('Password has been reset successfully');
                },
                onError: err => {
                    message.error(err?.message || 'Something went wrong');
                },
            },
        );
    };

    const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = errorInfo => {
        // Do something on failed submit form
    };

    return (
        <div css={styles}>
            <AuthPageLayout>
                {!verifySuccess && (
                    <AuthFormWrapper
                        title="Create new password"
                        description="Your new password must be unique from those previously used."
                    >
                        <Form form={form} initialValues={{}} onFinish={onFinish} onFinishFailed={onFinishFailed}>
                            <Form.Item<FieldType>
                                name="password"
                                rules={[{ required: true, message: 'Please input your password!' }]}
                            >
                                <Input.Password
                                    size="large"
                                    width={100}
                                    placeholder="Password"
                                    prefix={<LockOutlined />}
                                />
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
                                    Reset Password
                                </BaseButton>
                            </Form.Item>
                        </Form>
                    </AuthFormWrapper>
                )}
                {verifySuccess && ( // Conditionally render success page
                    <AuthResultPage
                        icon={SuccessfulIcon}
                        title="SUCCESSFULLY!"
                        description="Password has been reset successfully"
                        btnNavigateTo={PATHS.SIGNIN}
                        btnText="Back to login"
                    />
                )}
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

export default CreateNewPasswordPage;
