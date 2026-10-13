package cn.ayeez.blogserver.service;

import cn.ayeez.blogserver.config.OssProperties;
import org.junit.jupiter.api.Test;
import javax.xml.bind.JAXBContext;
import java.nio.charset.StandardCharsets;
import static org.junit.jupiter.api.Assertions.*;

class OssImageServiceTest {
    private final byte[] png = {(byte)137, 80, 78, 71, 13, 10, 26, 10};

    @Test
    void detectsSupportedFormatsFromBytes() {
        assertEquals("png", OssImageService.imageExtension(png));
        assertEquals("jpg", OssImageService.imageExtension(new byte[]{(byte)255, (byte)216, (byte)255}));
        assertEquals("gif", OssImageService.imageExtension("GIF89a123".getBytes(StandardCharsets.US_ASCII)));
        assertEquals("webp", OssImageService.imageExtension("RIFF1234WEBP".getBytes(StandardCharsets.US_ASCII)));
    }

    @Test
    void rejectsEmptyOversizedAndActiveContent() {
        assertThrows(IllegalArgumentException.class, () -> OssImageService.imageExtension(new byte[0]));
        assertThrows(IllegalArgumentException.class, () -> OssImageService.imageExtension(new byte[OssImageService.MAX_BYTES + 1]));
        assertThrows(IllegalArgumentException.class, () -> OssImageService.imageExtension("<svg></svg>".getBytes()));
        assertThrows(IllegalArgumentException.class, () -> OssImageService.imageExtension("<html></html>".getBytes()));
    }

    @Test
    void rejectsMissingConfigurationAndInvalidDirectoryBeforeNetworkCall() {
        OssImageService service = new OssImageService(new OssProperties());
        assertThrows(IllegalArgumentException.class, () -> service.upload(png, "../other"));
        assertThrows(IllegalStateException.class, () -> service.upload(png, "covers"));
    }

    @Test
    void acceptsHttpImageUrlButKeepsUploadEncrypted() {
        OssProperties properties = new OssProperties();
        properties.setEndpoint("https://oss-cn-shanghai.aliyuncs.com");
        properties.setRegion("cn-shanghai");
        properties.setBucketName("test-bucket");
        properties.setAccessKeyId("test-only");
        properties.setAccessKeySecret("test-only");
        properties.setPublicUrl("http://img.lingoace-community.xyz");
        OssImageService service = new OssImageService(properties);
        assertDoesNotThrow(service::requireConfigured);
        properties.setPublicUrl("https://img.lingoace-community.xyz");
        assertDoesNotThrow(service::requireConfigured);
        properties.setPublicUrl("javascript:alert(1)");
        assertThrows(IllegalStateException.class, service::requireConfigured);
        properties.setPublicUrl("http://img.lingoace-community.xyz");
        properties.setEndpoint("http://oss-cn-shanghai.aliyuncs.com");
        assertThrows(IllegalStateException.class, service::requireConfigured);
    }

    @Test
    void sdkXmlRuntimeWorksOnJava17() throws Exception {
        assertNotNull(JAXBContext.newInstance(OssProperties.class));
    }
}
