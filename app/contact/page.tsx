"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, MessageSquare, Users, Zap, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // 模拟提交过程
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      setFormData({ name: "", email: "", company: "", message: "" })
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">联系我们</h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            有任何问题或合作意向？我们很乐意与您交流
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                发送消息
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isSubmitted ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>感谢您的消息！我们会在24小时内回复您。</AlertDescription>
                </Alert>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">姓名 *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="请输入您的姓名"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">邮箱 *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="请输入您的邮箱"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">公司/组织</Label>
                    <Input
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder="请输入您的公司或组织名称"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">消息内容 *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      placeholder="请详细描述您的问题或合作意向..."
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                    size="lg"
                  >
                    {isSubmitting ? "发送中..." : "发送消息"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Contact Info & Partnership */}
          <div className="space-y-8">
            {/* Contact Information */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  联系方式
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-slate-900 dark:text-white">邮箱</h4>
                  <p className="text-slate-600 dark:text-slate-400">contact@musicconverter.com</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-slate-900 dark:text-white">技术支持</h4>
                  <p className="text-slate-600 dark:text-slate-400">support@musicconverter.com</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-slate-900 dark:text-white">商务合作</h4>
                  <p className="text-slate-600 dark:text-slate-400">business@musicconverter.com</p>
                </div>
              </CardContent>
            </Card>

            {/* Partnership Opportunities */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  合作机会
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Zap className="h-5 w-5 text-slate-600 dark:text-slate-300 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white">技术合作</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">API集成、技术授权、定制开发</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-slate-600 dark:text-slate-300 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white">渠道合作</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">分销代理、品牌合作、联合推广</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-slate-600 dark:text-slate-300 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white">投资合作</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">战略投资、业务拓展、市场合作</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Response Time */}
            <Card className="border-0 shadow-lg bg-slate-900 dark:bg-slate-800 text-white">
              <CardContent className="p-6">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold">快速响应</h3>
                  <p className="text-slate-300">我们承诺在24小时内回复您的消息</p>
                  <div className="flex justify-center items-center gap-2 text-sm text-slate-400">
                    <CheckCircle className="h-4 w-4" />
                    <span>专业团队 • 及时回复</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <Card className="border-0 shadow-lg mt-12">
          <CardHeader>
            <CardTitle>常见问题</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white mb-2">转换服务是否免费？</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    基础转换服务完全免费，我们也提供企业级的高级服务。
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white mb-2">是否支持批量转换？</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    目前支持单文件转换，批量转换功能正在开发中。
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white mb-2">文件安全如何保障？</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    所有转换过程在本地完成，不会上传文件到服务器。
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white mb-2">如何获得技术支持？</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    通过邮箱或联系表单联系我们，我们会及时为您解答。
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
