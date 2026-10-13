package cn.ayeez.blogserver.controller.admin;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class AdminUploadControllerTest {
    @Test
    void distinguishesCredentialPermissionAndEndpointFailures() {
        assertTrue(AdminUploadController.ossErrorMessage("SignatureDoesNotMatch").contains("同一对"));
        assertTrue(AdminUploadController.ossErrorMessage("AccessDenied").contains("oss:PutObject"));
        assertTrue(AdminUploadController.ossErrorMessage("PublicEndpointForbidden").contains("内网 Endpoint"));
        assertNotNull(AdminUploadController.ossErrorMessage(null));
    }
}
