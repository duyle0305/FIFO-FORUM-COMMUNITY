import type { RootState } from '@/stores';
import type { FormProps } from 'antd';
import type { FC } from 'react';

import { css } from '@emotion/react';
import { Form, Input } from 'antd';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import AuthFormWrapper from '@/components/authen/form-wrapper';
import AuthPageLayout from '@/components/authen/layout';
import BaseButton from '@/components/core/button';
import { OTP_EXPIRE_TIME } from '@/consts/common';
import {
    useOtpVerifyForgetPassword,
    useResendOtpForgetPassword,
} from '@/hooks/mutate/auth/use-otp-verify-forget-password';
import { useMessage } from '@/hooks/use-message';
import { PATHS } from '@/utils/paths';

type FieldType = {
    otp: string;
};

const VerifyOtpResetPasswordPage: FC = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const { error } = useMessage();

    const email = useSelector((state: RootState) => state.account?.email);

    const [timeCount, setTimeCount] = useState(OTP_EXPIRE_TIME);

    const { mutate: verifyOtp, isPending: isPendingVerifyOtp } = useOtpVerifyForgetPassword();
    const { mutate: resendOtp, isPending: isPendingResendOtp } = useResendOtpForgetPassword();

    const onFinish: FormProps<FieldType>['onFinish'] = async values => {
        verifyOtp(
            {
                email: email as string,
                otp: values.otp,
            },
            {
                onSuccess: () => {
                    navigate(PATHS.CREATE_NEW_PASSWORD);
                },
                onError: err => {
                    error(err.message);
                },
            },
        );
    };

    const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = () => {
        // Do something on failed submit form
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeCount(prev => {
                if (prev === 0) {
                    clearInterval(interval);

                    return 0;
                }

                return prev - 1000;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div css={styles}>
            <AuthPageLayout>
                <AuthFormWrapper
                    title="OTP Verification"
                    description="Enter the verification code we just sent on your email address."
                >
                    {timeCount > 0 && (
                        <p>
                            OTP will expire in {Math.floor(timeCount / 60000)}:
                            {Math.floor((timeCount % 60000) / 1000)
                                .toString()
                                .padStart(2, '0')}
                        </p>
                    )}
                    <Form form={form} initialValues={{}} onFinish={onFinish} onFinishFailed={onFinishFailed}>
                        <Form.Item<FieldType> name="otp" rules={[{ required: true, message: 'Please input OTP!' }]}>
                            <Input.OTP
                                autoFocus
                                length={4}
                                variant="filled"
                                size="large"
                                inputMode="numeric"
                                style={{ width: '100%', fontSize: '22px' }}
                            />
                        </Form.Item>

                        <Form.Item>
                            <BaseButton
                                className="auth-submit-button "
                                type="link"
                                loading={isPendingResendOtp}
                                onClick={() => {
                                    resendOtp({ email: localStorage.getItem('email') as string });
                                    setTimeCount(OTP_EXPIRE_TIME); // Resets the timer
                                }}
                            >
                                Resend OTP
                            </BaseButton>

                            <BaseButton
                                size="large"
                                className="auth-submit-button "
                                shape="round"
                                type="primary"
                                htmlType="submit"
                                loading={isPendingVerifyOtp}
                                disabled={timeCount === 0}
                            >
                                Verify OTP
                            </BaseButton>
                        </Form.Item>
                    </Form>
                </AuthFormWrapper>

                {/* {verifySuccess && ( // Conditionally render success page
                    <AuthResultPage
                        icon={SuccessfulIcon}
                        title="SUCCESSFULLY!"
                        description="Your account has been created"
                        btnNavigateTo={PATHS.SIGNIN}
                        btnText="Back to login"
                    />
                )} */}
            </AuthPageLayout>
        </div>
    );
};

const styles = css(`
    .ant-otp {
        gap: 15px;

        .ant-input {
            font-size: 22px;
            font-weight: 700;
            width: calc(100%/4);
            aspect-ratio : 1 / 1
        }
    }
`);

export default VerifyOtpResetPasswordPage;
