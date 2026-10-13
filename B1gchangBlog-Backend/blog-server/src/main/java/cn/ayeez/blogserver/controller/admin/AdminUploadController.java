package cn.ayeez.blogserver.controller.admin;

import cn.ayeez.blogcommon.util.Result;
import cn.ayeez.blogserver.service.OssImageService;
import com.aliyun.oss.OSSException;
import com.aliyun.oss.ClientException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/upload")
public class AdminUploadController {
    private final OssImageService images;

    @PostMapping("/oss")
    public Result<Map<String, String>> upload(@RequestParam MultipartFile file,
            @RequestParam(defaultValue = "images") String dir) {
        try {
            if (file.isEmpty() || file.getSize() > OssImageService.MAX_BYTES) {
                return Result.error(400, "图片不能为空，且不能超过 10MB");
            }
            return Result.success(Map.of("url", images.upload(file.getBytes(), dir)));
        } catch (IllegalArgumentException e) {
            return Result.error(400, e.getMessage());
        } catch (IllegalStateException e) {
            return Result.error(500, e.getMessage());
        } catch (OSSException e) {
            log.warn("OSS 上传被拒绝，code={}, requestId={}", e.getErrorCode(), e.getRequestId());
            return Result.error(500, ossErrorMessage(e.getErrorCode()));
        } catch (ClientException e) {
            log.warn("OSS 上传连接失败，code={}", e.getErrorCode());
            return Result.error(500, "UnknownHost".equals(e.getErrorCode())
                    ? "OSS 域名解析失败，请检查 Endpoint 和本机 DNS"
                    : "无法连接 OSS，请检查本机网络和 Endpoint");
        } catch (Exception e) {
            log.warn("OSS 图片上传失败，异常类型：{}", e.getClass().getSimpleName());
            return Result.error(500, "OSS 上传失败，请检查 Bucket 地域、RAM 权限和服务器网络");
        }
    }

    static String ossErrorMessage(String code) {
        return switch (code == null ? "" : code) {
            case "SignatureDoesNotMatch" -> "OSS 签名校验失败，请核对 AccessKey ID 与 Secret 是否为同一对、复制是否完整（SignatureDoesNotMatch）";
            case "InvalidAccessKeyId" -> "OSS AccessKey ID 无效，请检查密钥是否正确或已被禁用（InvalidAccessKeyId）";
            case "AccessDenied" -> "OSS 拒绝上传，请检查 RAM 用户是否有该 Bucket 图片目录的 oss:PutObject 权限（AccessDenied）";
            case "NoSuchBucket" -> "OSS Bucket 不存在，请检查 Bucket 名称和地域（NoSuchBucket）";
            case "PublicEndpointForbidden" -> "当前账号禁止使用 OSS 默认公网上传地址，请在同地域服务器使用内网 Endpoint，或配置自定义域名上传（PublicEndpointForbidden）";
            default -> "OSS 上传被拒绝，请检查配置和 RAM 权限";
        };
    }
}
