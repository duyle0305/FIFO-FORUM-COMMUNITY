import { Flex, Typography } from 'antd'
import React from 'react'

const Term = () => {
  return (
      <Flex vertical gap={20}>
          <Typography.Title level={2}>FIFO Terms and Rules</Typography.Title>

          <Flex vertical gap={10}>
              <Typography.Paragraph>
                  The providers ("we", "us", "our") of the service provided by this web site ("Service") are not
                  responsible for any user-generated content and accounts. Content submitted express the views of their
                  author only.
              </Typography.Paragraph>
              <Typography.Paragraph>
                  This Service is only available to users who are at least 13 years old. If you are younger than this,
                  please do not register for this Service. If you register for this Service, you represent that you are
                  this age or older.
              </Typography.Paragraph>
              <Typography.Paragraph>
                  All content you submit, upload, or otherwise make available to the Service ("Content") may be reviewed
                  by staff members. All Content you submit or upload may be sent to third-party verification services
                  (including, but not limited to, spam prevention services). Do not submit any Content that you consider
                  to be private or confidential.
              </Typography.Paragraph>
              <Typography.Paragraph>
                  You agree to not use the Service to submit or link to any Content which is defamatory, abusive,
                  hateful, threatening, spam or spam-like, likely to offend, contains adult or objectionable content,
                  contains personal information of others, risks copyright infringement, encourages unlawful activity,
                  or otherwise violates any laws. You are entirely responsible for the content of, and any harm
                  resulting from, that Content or your conduct.
              </Typography.Paragraph>
              <Typography.Paragraph>
                  We may remove or modify any Content submitted at any time, with or without cause, with or without
                  notice. Requests for Content to be removed or modified will be undertaken only at our discretion. We
                  may terminate your access to all or any part of the Service at any time, with or without cause, with
                  or without notice.
              </Typography.Paragraph>
              <Typography.Paragraph>
                  You are granting us with a non-exclusive, permanent, irrevocable, unlimited license to use, publish,
                  or re-publish your Content in connection with the Service. You retain copyright over the Content.
              </Typography.Paragraph>
              <Typography.Paragraph>These terms may be changed at any time without notice.</Typography.Paragraph>
              <Typography.Paragraph>
                  If you do not agree with these terms, please do not register or use the Service. Use of the Service
                  constitutes acceptance of these terms. If you wish to close your account, please contact us.
              </Typography.Paragraph>
          </Flex>
      </Flex>
  );
}

export default Term