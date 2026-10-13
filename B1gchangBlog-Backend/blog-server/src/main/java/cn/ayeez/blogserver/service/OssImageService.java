package cn.ayeez.blogserver.service;

import cn.ayeez.blogserver.config.OssProperties;
import com.aliyun.oss.ClientBuilderConfiguration;
import com.aliyun.oss.OSS;
import com.aliyun.oss.OSSClientBuilder;
import com.aliyun.oss.common.auth.DefaultCredentialProvider;
import com.aliyun.oss.common.comm.SignVersion;
import com.aliyun.oss.model.ObjectMetadata;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OssImageService {
    public static final int MAX_BYTES = 10 * 1024 * 1024;
    private final OssProperties properties;

    public void requireConfigured() {
        if (!StringUtils.hasText(properties.getEndpoint()) || !StringUtils.hasText(properties.getRegion())
                || !StringUtils.hasText(properties.getBucketName()) || !StringUtils.hasText(properties.getAccessKeyId())
                || !StringUtils.hasText(properties.getAccessKeySecret()) || !StringUtils.hasText(properties.getPublicUrl())) {
            throw new IllegalStateException("OSS 配置未完成，请设置 OSS_ENDPOINT、OSS_REGION、OSS_BUCKET、OSS_ACCESS_KEY_ID、OSS_ACCESS_KEY_SECRET、OSS_PUBLIC_URL");
        }
        if (!properties.getEndpoint().startsWith("https://")) {
            throw new IllegalStateException("OSS_ENDPOINT 必须使用 https://");
        }
        if (!properties.getPublicUrl().startsWith("http://") && !properties.getPublicUrl().startsWith("https://")) {
            throw new IllegalStateException("OSS_PUBLIC_URL 必须使用 http:// 或 https://");
        }
    }

    public String upload(byte[] data, String dir) {
        String extension = imageExtension(data);
        if (!Arrays.asList("covers", "talks", "images").contains(dir)) {
            throw new IllegalArgumentException("图片目录只允许 covers、talks 或 images");
        }
        requireConfigured();
        String key = dir + "/" + LocalDate.now().toString().replace('-', '/') + "/" + UUID.randomUUID() + "." + extension;
        ClientBuilderConfiguration config = new ClientBuilderConfiguration();
        config.setSignatureVersion(SignVersion.V4);
        config.setConnectionTimeout(10000);
        config.setSocketTimeout(30000);
        OSS client = OSSClientBuilder.create()
                .endpoint(properties.getEndpoint())
                .region(properties.getRegion())
                .credentialsProvider(new DefaultCredentialProvider(properties.getAccessKeyId(), properties.getAccessKeySecret()))
                .clientConfiguration(config).build();
        try {
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentLength(data.length);
            metadata.setContentType("image/" + (extension.equals("jpg") ? "jpeg" : extension));
            client.putObject(properties.getBucketName(), key, new ByteArrayInputStream(data), metadata);
            return properties.getPublicUrl().replaceAll("/+$", "") + "/" + key;
        } finally {
            client.shutdown();
        }
    }

    // 根据文件内容判断格式，避免把可执行 HTML/SVG 当成公开图片上传。
    static String imageExtension(byte[] data) {
        if (data == null || data.length == 0 || data.length > MAX_BYTES) {
            throw new IllegalArgumentException("图片不能为空，且不能超过 10MB");
        }
        if (data.length >= 8 && Arrays.equals(Arrays.copyOf(data, 8), new byte[]{(byte)137, 80, 78, 71, 13, 10, 26, 10})) return "png";
        if (data.length >= 3 && data[0] == (byte)255 && data[1] == (byte)216 && data[2] == (byte)255) return "jpg";
        String header = new String(data, 0, Math.min(data.length, 12), StandardCharsets.US_ASCII);
        if (header.startsWith("GIF87a") || header.startsWith("GIF89a")) return "gif";
        if (header.length() == 12 && header.startsWith("RIFF") && header.endsWith("WEBP")) return "webp";
        throw new IllegalArgumentException("只支持 PNG、JPG、GIF、WebP 图片");
    }
}
